import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { getCurrentUserProfile } from "@/appWrite-client/auth-helpers";
import { databaseClient, DATABASE_ID, COLLECTIONS } from "@/appWrite-client/settings.config";
import { ID, Query } from "appwrite";
import { message, Modal, Input, Select, Button, Table, Tag, Space, Tabs, Descriptions, Card } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

export default function DisciplineDetail() {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [discipline, setDiscipline] = useState(null);
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [providerDisciplines, setProviderDisciplines] = useState([]);
  const [isServiceModalVisible, setIsServiceModalVisible] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceFormData, setServiceFormData] = useState({
    name: "",
    description: "",
    serviceType: "clinical",
    status: "active",
    certificationLevel: "provider",
    duration: 60,
    capacity: 1,
    cost: 0,
  });
  const router = useRouter();
  const { disciplineId } = router.query;

  useEffect(() => {
    if (disciplineId) {
      checkAuthAndLoadData();
    }
  }, [disciplineId, router]);

  const checkAuthAndLoadData = async () => {
    try {
      const profile = await getCurrentUserProfile();
      
      if (profile.role !== 'admin') {
        router.push('/home');
        return;
      }

      setUserProfile(profile);
      await loadDiscipline();
      await loadServices();
      await loadProviders();
      await loadProviderDisciplines();
      setLoading(false);
    } catch (error) {
      console.error("Auth error:", error);
      router.push('/login');
    }
  };

  const loadDiscipline = async () => {
    try {
      const response = await databaseClient.getDocument(
        DATABASE_ID,
        COLLECTIONS.DISCIPLINES,
        disciplineId
      );
      setDiscipline(response);
    } catch (error) {
      console.error("Error loading discipline:", error);
      message.error("Failed to load discipline");
    }
  };

  const loadServices = async () => {
    try {
      const response = await databaseClient.listDocuments(
        DATABASE_ID,
        COLLECTIONS.SERVICES,
        [Query.equal('disciplineId', disciplineId)]
      );
      setServices(response.documents);
    } catch (error) {
      console.error("Error loading services:", error);
      setServices([]);
    }
  };

  const loadProviders = async () => {
    try {
      const response = await databaseClient.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DOCTORS
      );
      setProviders(response.documents);
    } catch (error) {
      console.error("Error loading providers:", error);
    }
  };

  const loadProviderDisciplines = async () => {
    try {
      const response = await databaseClient.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PROVIDER_DISCIPLINES,
        [Query.equal('disciplineId', disciplineId)]
      );
      setProviderDisciplines(response.documents);
    } catch (error) {
      console.error("Error loading provider disciplines:", error);
      setProviderDisciplines([]);
    }
  };

  const handleCreateOrUpdateService = async () => {
    try {
      const serviceData = {
        ...serviceFormData,
        disciplineId,
        approvedBy: editingService?.approvedBy || (serviceFormData.status === 'active' ? userProfile.account.$id : null),
      };

      if (editingService) {
        await databaseClient.updateDocument(
          DATABASE_ID,
          COLLECTIONS.SERVICES,
          editingService.$id,
          serviceData
        );
        message.success("Service updated successfully!");
      } else {
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

      setIsServiceModalVisible(false);
      resetServiceForm();
      await loadServices();
    } catch (error) {
      console.error("Error saving service:", error);
      message.error(error.message || "Failed to save service. Make sure the 'services' collection exists.");
    }
  };

  const handleDeleteService = async (serviceId) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this service?',
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await databaseClient.deleteDocument(DATABASE_ID, COLLECTIONS.SERVICES, serviceId);
          message.success("Service deleted successfully!");
          await loadServices();
        } catch (error) {
          console.error("Error deleting service:", error);
          message.error("Failed to delete service");
        }
      },
    });
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setServiceFormData({
      name: service.name,
      description: service.description || "",
      serviceType: service.serviceType || "clinical",
      status: service.status || "active",
      certificationLevel: service.certificationLevel || "none",
      duration: service.duration || 60,
      capacity: service.capacity || 1,
      cost: service.cost || 0,
    });
    setIsServiceModalVisible(true);
  };

  const resetServiceForm = () => {
    setServiceFormData({
      name: "",
      description: "",
      serviceType: "clinical",
      status: "active",
      certificationLevel: "provider",
      duration: 60,
      capacity: 1,
      cost: 0,
    });
    setEditingService(null);
  };

  const serviceColumns = [
    {
      title: 'Service Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div className="font-semibold">{text}</div>
          <div className="text-xs text-gray-500">{record.serviceType}</div>
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Certification Level',
      dataIndex: 'certificationLevel',
      key: 'certificationLevel',
      render: (level) => {
        const colors = {
          provider: 'blue',
          advanced: 'purple',
          master: 'gold',
          instructor: 'cyan',
          licensed: 'green',
          admin: 'red',
        };
        return <Tag color={colors[level]}>{level?.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          active: 'green',
          inactive: 'gray',
          'under-review': 'orange',
          archived: 'red',
        };
        return <Tag color={colors[status]}>{status?.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditService(record)}>
            Edit
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDeleteService(record.$id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const providerColumns = [
    {
      title: 'Provider Name',
      key: 'provider',
      render: (_, record) => {
        const provider = providers.find(p => p.$id === record.providerId);
        return provider?.name || 'Unknown';
      },
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const colors = {
          practitioner: 'cyan',
          coordinator: 'blue',
          lead: 'purple',
          apprendtice: 'orange',
          mentor: 'green',
          instructor: 'geekblue',
          admin: 'red',
          technologist: 'lime',
          author: 'magenta',
          chaplain: 'volcano',
          minister: 'gold',
          adept: 'purple',
          master: 'gold',
          peer: 'cyan',
        };
        return <Tag color={colors[role]}>{role?.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Certification Level',
      dataIndex: 'certificationLevel',
      key: 'certificationLevel',
      render: (level) => <Tag>{level?.toUpperCase()}</Tag>,
    },
    {
      title: 'Certified Services',
      dataIndex: 'serviceIds',
      key: 'serviceIds',
      render: (serviceIds) => serviceIds?.length || 0,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          active: 'green',
          inactive: 'gray',
          suspended: 'red',
          pending: 'orange',
          under_review: 'blue',
        };
        return <Tag color={colors[status]}>{status?.replace('_', ' ').toUpperCase()}</Tag>;
      },
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (!discipline) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-600">Discipline not found</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{discipline.name} | Discipline Management</title>
      </Head>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/admin/disciplines" className="text-[#2A9988] hover:underline flex items-center gap-2 mb-4">
              <ArrowLeftOutlined /> Back to Disciplines
            </Link>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">{discipline.name}</h1>
                <p className="text-gray-600 mt-2">{discipline.description}</p>
              </div>
              <Tag color={discipline.status === 'active' ? 'green' : 'gray'} className="text-lg px-4 py-1">
                {discipline.status?.toUpperCase()}
              </Tag>
            </div>
          </div>

          {/* Discipline Details Card */}
          <Card className="mb-8">
            <Descriptions title="Discipline Information" column={2}>
              <Descriptions.Item label="Slug">{discipline.slug}</Descriptions.Item>
              <Descriptions.Item label="Lead Provider">
                {providers.find(p => p.$id === discipline.leadProviderId)?.name || 'Unassigned'}
              </Descriptions.Item>
              <Descriptions.Item label="Min Certification Level">
                {discipline.minCertificationLevel ? (
                  <Tag color="blue">{discipline.minCertificationLevel.toUpperCase()}</Tag>
                ) : (
                  <Tag color="default">PROVIDER</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="License Required">
                {discipline.licenseRequired ? (
                  <div>
                    <Tag icon={<CheckCircleOutlined />} color="orange">Yes</Tag>
                    {discipline.licenseType && (
                      <Tag color="blue" className="ml-2">{discipline.licenseType.toUpperCase()}</Tag>
                    )}
                  </div>
                ) : (
                  <Tag icon={<CloseCircleOutlined />} color="green">No</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Total Services">{services.length}</Descriptions.Item>
              <Descriptions.Item label="Certified Providers">{providerDisciplines.length}</Descriptions.Item>
              <Descriptions.Item label="Created">
                {discipline.createdAt ? new Date(discipline.createdAt).toLocaleDateString() : 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Tabs */}
          <Tabs defaultActiveKey="services">
            <TabPane tab={`Services (${services.length})`} key="services">
              <div className="mb-4 flex justify-end">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    resetServiceForm();
                    setIsServiceModalVisible(true);
                  }}
                  className="bg-[#2A9988]"
                >
                  Create Service
                </Button>
              </div>
              <Table
                columns={serviceColumns}
                dataSource={services}
                rowKey="$id"
                pagination={{ pageSize: 10 }}
                locale={{
                  emptyText: "No services yet. Create your first service for this discipline.",
                }}
              />
            </TabPane>

            <TabPane tab={`Certified Providers (${providerDisciplines.length})`} key="providers">
              <Table
                columns={providerColumns}
                dataSource={providerDisciplines}
                rowKey="$id"
                pagination={{ pageSize: 10 }}
                locale={{
                  emptyText: "No certified providers yet.",
                }}
              />
            </TabPane>
          </Tabs>
        </div>

        {/* Service Modal */}
        <Modal
          title={editingService ? "Edit Service" : "Create New Service"}
          open={isServiceModalVisible}
          onOk={handleCreateOrUpdateService}
          onCancel={() => {
            setIsServiceModalVisible(false);
            resetServiceForm();
          }}
          width={700}
          okText={editingService ? "Update" : "Create"}
          okButtonProps={{ className: "bg-[#2A9988]" }}
        >
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Name *</label>
              <Input
                value={serviceFormData.name}
                onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                placeholder="e.g., Individual Counseling Session, Group Meditation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <TextArea
                value={serviceFormData.description}
                onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                placeholder="Describe the service"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                <Select
                  value={serviceFormData.serviceType}
                  onChange={(value) => setServiceFormData({ ...serviceFormData, serviceType: value })}
                  className="w-full"
                >
                  <Option value="clinical">Clinical</Option>
                  <Option value="community">Community</Option>
                  <Option value="consult">Consult</Option>
                  <Option value="ministerial">Ministerial</Option>
                  <Option value="casework">Casework</Option>
                  <Option value="coaching">Coaching</Option>
                  <Option value="admin">Admin</Option>
                  <Option value="provider_support">Provider Support</Option>
                  <Option value="customer_support">Customer Support</Option>
                  <Option value="ceremonial">Ceremonial</Option>
                  <Option value="event">Event</Option>
                  <Option value="kava">Kava</Option>
                  <Option value="orientation">Orientation</Option>
                  <Option value="retreat">Retreat</Option>
                  <Option value="group">Group</Option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Select
                  value={serviceFormData.status}
                  onChange={(value) => setServiceFormData({ ...serviceFormData, status: value })}
                  className="w-full"
                >
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                  <Option value="under-review">Under Review</Option>
                  <Option value="archived">Archived</Option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certification Level</label>
                <Select
                  value={serviceFormData.certificationLevel}
                  onChange={(value) => setServiceFormData({ ...serviceFormData, certificationLevel: value })}
                  className="w-full"
                >
                  <Option value="provider">Provider</Option>
                  <Option value="advanced">Advanced</Option>
                  <Option value="master">Master</Option>
                  <Option value="instructor">Instructor</Option>
                  <Option value="licensed">Licensed</Option>
                  <Option value="admin">Admin</Option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <Input
                  type="number"
                  value={serviceFormData.duration}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, duration: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <Input
                  type="number"
                  value={serviceFormData.capacity}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, capacity: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base Cost</label>
                <Input
                  type="number"
                  value={serviceFormData.cost}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, cost: parseFloat(e.target.value) || 0 })}
                  prefix="$"
                />
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
