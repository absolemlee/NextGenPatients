import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { getCurrentUserProfile } from "@/appWrite-client/auth-helpers";
import { databaseClient, DATABASE_ID, COLLECTIONS } from "@/appWrite-client/settings.config";
import { ID, Query } from "appwrite";
import { message, Modal, Input, Select, Button, Table, Tag, Space, InputNumber } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;

export default function ServicesManagement() {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    disciplineId: "",
    serviceType: "clinical",
    duration: 60,
    cost: 0,
    status: "active",
    requireApproval: false,
    capacity: 1,
  });
  const router = useRouter();

  useEffect(() => {
    checkAuthAndLoadData();
  }, [router]);

  const checkAuthAndLoadData = async () => {
    try {
      const profile = await getCurrentUserProfile();
      
      if (profile.role !== 'admin') {
        router.push('/home');
        return;
      }

      setUserProfile(profile);
      await loadServices();
      await loadDisciplines();
      setLoading(false);
    } catch (error) {
      console.error("Auth error:", error);
      router.push('/login');
    }
  };

  const loadServices = async () => {
    try {
      const response = await databaseClient.listDocuments(
        DATABASE_ID,
        COLLECTIONS.SERVICES
      );
      setServices(response.documents);
    } catch (error) {
      console.error("Error loading services:", error);
      setServices([]);
    }
  };

  const loadDisciplines = async () => {
    try {
      const response = await databaseClient.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DISCIPLINES
      );
      setDisciplines(response.documents);
    } catch (error) {
      console.error("Error loading disciplines:", error);
    }
  };

  const handleCreateOrUpdate = async () => {
    try {
      if (!formData.name || !formData.disciplineId) {
        message.error("Please fill in all required fields");
        return;
      }

      const requireApproval = formData.requireApproval === true || formData.requireApproval === "true";

      const serviceData = {
        name: formData.name,
        description: formData.description || "",
        disciplineId: formData.disciplineId,
        serviceType: formData.serviceType || "clinical",
        duration: parseInt(formData.duration) || 60,
        cost: parseFloat(formData.cost) || 0,
        capacity: parseInt(formData.capacity) || 1,
        status: formData.status || "active",
        requireApproval: requireApproval,
        approvedBy: formData.status === 'active' ? userProfile?.account?.$id || null : null,
      };

      if (editingService) {
        // Update existing service
        await databaseClient.updateDocument(
          DATABASE_ID,
          COLLECTIONS.SERVICES,
          editingService.$id,
          serviceData
        );
        message.success("Service updated successfully!");
      } else {
        // Create new service
        const newServiceId = ID.unique();
        await databaseClient.createDocument(
          DATABASE_ID,
          COLLECTIONS.SERVICES,
          newServiceId,
          {
            ...serviceData,
            serviceId: newServiceId,
          }
        );
        message.success("Service created successfully!");
      }

      setIsModalVisible(false);
      resetForm();
      await loadServices();
    } catch (error) {
      console.error("Error saving service:", error);
      message.error(error.message || "Failed to save service");
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      disciplineId: service.disciplineId,
      serviceType: service.serviceType || "clinical",
      duration: service.duration || 60,
      cost: service.cost || 0,
      status: service.status || "active",
      requireApproval: service.requireApproval || false,
      capacity: service.capacity || 1,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (serviceId) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this service?',
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await databaseClient.deleteDocument(
            DATABASE_ID,
            COLLECTIONS.SERVICES,
            serviceId
          );
          message.success("Service deleted successfully!");
          await loadServices();
        } catch (error) {
          console.error("Error deleting service:", error);
          message.error("Failed to delete service");
        }
      },
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      disciplineId: "",
      serviceType: "clinical",
      duration: 60,
      cost: 0,
      status: "active",
      requireApproval: false,
      capacity: 1,
    });
    setEditingService(null);
  };

  const getDisciplineName = (disciplineId) => {
    const discipline = disciplines.find(d => d.$id === disciplineId);
    return discipline ? discipline.name : 'Unknown';
  };

  const columns = [
    {
      title: 'Service Name',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      render: (text, record) => (
        <div>
          <div className="font-semibold">{text}</div>
          <div className="text-xs text-gray-500">{getDisciplineName(record.disciplineId)}</div>
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: '25%',
    },
    {
      title: 'Type',
      dataIndex: 'serviceType',
      key: 'serviceType',
      render: (type) => {
        const colors = {
          clinical: 'blue',
          community: 'green',
          consult: 'cyan',
          ministerial: 'purple',
          casework: 'orange',
          coaching: 'magenta',
          aurologia: 'gold',
          bioenergia: 'lime',
          oraculo: 'volcano',
          admin: 'red',
          provider_support: 'geekblue',
          customer_support: 'blue',
          ceremonial: 'purple',
          event: 'green',
          kava: 'orange',
        };
        return <Tag color={colors[type] || 'default'}>{type?.toUpperCase().replace('_', ' ')}</Tag>;
      },
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => `${duration} min`,
    },
    {
      title: 'Cost',
      dataIndex: 'cost',
      key: 'cost',
      render: (cost) => cost > 0 ? `$${cost}` : 'Free',
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (capacity) => capacity || 1,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Approval',
      dataIndex: 'requireApproval',
      key: 'requireApproval',
      render: (requires) => (
        <Tag color={requires ? 'orange' : 'green'}>
          {requires ? 'Required' : 'Auto'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.$id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Service Management | Admin</title>
      </Head>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Service Management</h1>
              <p className="text-gray-600 mt-2">Create and manage all services across disciplines</p>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/dashboard" className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700">
                Back to Dashboard
              </Link>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  resetForm();
                  setIsModalVisible(true);
                }}
                className="bg-[#2A9988] hover:bg-[#1C665B]"
              >
                Create Service
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Total Services</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{services.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Active</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {services.filter(s => s.status === 'active').length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Clinical</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {services.filter(s => s.serviceType === 'clinical').length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Community</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {services.filter(s => s.serviceType === 'community').length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Paid Services</h3>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {services.filter(s => s.cost > 0).length}
              </p>
            </div>
          </div>

          {/* Services Table */}
          <div className="bg-white rounded-lg shadow">
            <Table
              columns={columns}
              dataSource={services}
              rowKey="$id"
              pagination={{ pageSize: 15 }}
              locale={{
                emptyText: (
                  <div className="py-12">
                    <p className="text-gray-500 mb-4">No services yet. Create your first service to get started.</p>
                  </div>
                ),
              }}
            />
          </div>
        </div>

        {/* Create/Edit Modal */}
        <Modal
          title={editingService ? "Edit Service" : "Create New Service"}
          open={isModalVisible}
          onOk={handleCreateOrUpdate}
          onCancel={() => {
            setIsModalVisible(false);
            resetForm();
          }}
          width={700}
          okText={editingService ? "Update" : "Create"}
          okButtonProps={{ className: "bg-[#2A9988]" }}
        >
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discipline *
              </label>
              <Select
                value={formData.disciplineId}
                onChange={(value) => setFormData({ ...formData, disciplineId: value })}
                className="w-full"
                placeholder="Select discipline"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {disciplines.map((discipline) => (
                  <Option key={discipline.$id} value={discipline.$id}>
                    {discipline.name}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Individual Spiritual Counseling Session"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <TextArea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this service includes"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Type
                </label>
                <Select
                  value={formData.serviceType}
                  onChange={(value) => setFormData({ ...formData, serviceType: value })}
                  className="w-full"
                >
                  <Option value="clinical">Clinical</Option>
                  <Option value="community">Community</Option>
                  <Option value="consult">Consult</Option>
                  <Option value="ministerial">Ministerial</Option>
                  <Option value="casework">Casework</Option>
                  <Option value="coaching">Coaching</Option>
                  <Option value="aurologia">Aurologia</Option>
                  <Option value="bioenergia">Bioenergia</Option>
                  <Option value="oraculo">Oraculo</Option>
                  <Option value="admin">Admin</Option>
                  <Option value="provider_support">Provider Support</Option>
                  <Option value="customer_support">Customer Support</Option>
                  <Option value="ceremonial">Ceremonial</Option>
                  <Option value="event">Event</Option>
                  <Option value="kava">Kava</Option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Select
                  value={formData.status}
                  onChange={(value) => setFormData({ ...formData, status: value })}
                  className="w-full"
                >
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (min)
                </label>
                <InputNumber
                  value={formData.duration}
                  onChange={(value) => setFormData({ ...formData, duration: value })}
                  className="w-full"
                  min={5}
                  max={480}
                  step={5}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost ($)
                </label>
                <InputNumber
                  value={formData.cost}
                  onChange={(value) => setFormData({ ...formData, cost: value })}
                  className="w-full"
                  min={0}
                  step={5}
                  precision={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity
                </label>
                <InputNumber
                  value={formData.capacity}
                  onChange={(value) => setFormData({ ...formData, capacity: value })}
                  className="w-full"
                  min={1}
                  max={100}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requires Approval
              </label>
              <Select
                value={formData.requireApproval.toString()}
                onChange={(value) => setFormData({ ...formData, requireApproval: value === "true" })}
                className="w-full"
              >
                <Option value="false">No - Auto-approve bookings</Option>
                <Option value="true">Yes - Requires provider approval</Option>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                If enabled, bookings for this service must be approved by the provider
              </p>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
