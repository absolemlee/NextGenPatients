import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { getCurrentUserProfile } from "@/appWrite-client/auth-helpers";
import { databaseClient, DATABASE_ID, COLLECTIONS } from "@/appWrite-client/settings.config";
import { ID } from "appwrite";
import { message, Modal, Input, Select, Button, Table, Tag, Space } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;

export default function ProvidersManagement() {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [providers, setProviders] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialty: "",
    licenseNumber: "",
    role: "provider",
    verified: false,
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
      await loadProviders();
      await loadDisciplines();
      setLoading(false);
    } catch (error) {
      console.error("Auth error:", error);
      router.push('/login');
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

  const loadDisciplines = async () => {
    try {
      const response = await databaseClient.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DISCIPLINES
      );
      setDisciplines(response.documents);
    } catch (error) {
      console.error("Error loading disciplines:", error);
      setDisciplines([]);
    }
  };

  const handleCreateOrUpdate = async () => {
    try {
      const providerData = {
        ...formData,
        verified: formData.verified === "true" || formData.verified === true,
      };

      if (editingProvider) {
        await databaseClient.updateDocument(
          DATABASE_ID,
          COLLECTIONS.DOCTORS,
          editingProvider.$id,
          providerData
        );
        message.success("Provider updated successfully!");
      } else {
        await databaseClient.createDocument(
          DATABASE_ID,
          COLLECTIONS.DOCTORS,
          ID.unique(),
          {
            ...providerData,
            userId: "", // Set this if you have user account integration
          }
        );
        message.success("Provider created successfully!");
      }

      setIsModalVisible(false);
      resetForm();
      await loadProviders();
    } catch (error) {
      console.error("Error saving provider:", error);
      message.error(error.message || "Failed to save provider");
    }
  };

  const handleEdit = (provider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      email: provider.email,
      phone: provider.phone || "",
      specialty: provider.specialty || "",
      licenseNumber: provider.licenseNumber || "",
      role: provider.role || "provider",
      verified: provider.verified || false,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (providerId) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this provider?',
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await databaseClient.deleteDocument(
            DATABASE_ID,
            COLLECTIONS.DOCTORS,
            providerId
          );
          message.success("Provider deleted successfully!");
          await loadProviders();
        } catch (error) {
          console.error("Error deleting provider:", error);
          message.error("Failed to delete provider");
        }
      },
    });
  };

  const toggleVerification = async (provider) => {
    try {
      await databaseClient.updateDocument(
        DATABASE_ID,
        COLLECTIONS.DOCTORS,
        provider.$id,
        { verified: !provider.verified }
      );
      message.success(`Provider ${!provider.verified ? 'verified' : 'unverified'} successfully!`);
      await loadProviders();
    } catch (error) {
      console.error("Error updating verification:", error);
      message.error("Failed to update verification status");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      specialty: "",
      licenseNumber: "",
      role: "provider",
      verified: false,
    });
    setEditingProvider(null);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone || 'N/A',
    },
    {
      title: 'Discipline',
      dataIndex: 'specialty',
      key: 'specialty',
      render: (specialty) => specialty || 'N/A',
    },
    {
      title: 'License #',
      dataIndex: 'licenseNumber',
      key: 'licenseNumber',
      render: (num) => num || 'N/A',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'purple' : 'blue'}>
          {role?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Verified',
      dataIndex: 'verified',
      key: 'verified',
      render: (verified, record) => (
        <Button
          size="small"
          type={verified ? "default" : "primary"}
          icon={verified ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          onClick={() => toggleVerification(record)}
          className={verified ? "bg-green-50" : ""}
        >
          {verified ? 'Verified' : 'Pending'}
        </Button>
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
        <title>Provider Management | Admin</title>
      </Head>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Provider Management</h1>
              <p className="text-gray-600 mt-2">Manage all providers and their credentials</p>
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
                Add Provider
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Total Providers</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{providers.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Verified</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {providers.filter(p => p.verified).length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Pending</h3>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {providers.filter(p => !p.verified).length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Admins</h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {providers.filter(p => p.role === 'admin').length}
              </p>
            </div>
          </div>

          {/* Providers Table */}
          <div className="bg-white rounded-lg shadow">
            <Table
              columns={columns}
              dataSource={providers}
              rowKey="$id"
              pagination={{ pageSize: 10 }}
            />
          </div>
        </div>

        {/* Create/Edit Modal */}
        <Modal
          title={editingProvider ? "Edit Provider" : "Add New Provider"}
          open={isModalVisible}
          onOk={handleCreateOrUpdate}
          onCancel={() => {
            setIsModalVisible(false);
            resetForm();
          }}
          width={700}
          okText={editingProvider ? "Update" : "Create"}
          okButtonProps={{ className: "bg-[#2A9988]" }}
        >
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                <Input
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Discipline</label>
              <Select
                value={formData.specialty}
                onChange={(value) => setFormData({ ...formData, specialty: value })}
                className="w-full"
                placeholder="Select primary discipline"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
                allowClear
              >
                {disciplines.map(discipline => (
                  <Option key={discipline.$id} value={discipline.name}>
                    {discipline.name}
                  </Option>
                ))}
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Provider&apos;s main area of practice (can be certified in multiple via Certifications page)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <Select
                  value={formData.role}
                  onChange={(value) => setFormData({ ...formData, role: value })}
                  className="w-full"
                >
                  <Option value="provider">Provider</Option>
                  <Option value="admin">Admin</Option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Verification Status</label>
                <Select
                  value={formData.verified.toString()}
                  onChange={(value) => setFormData({ ...formData, verified: value })}
                  className="w-full"
                >
                  <Option value="false">Pending</Option>
                  <Option value="true">Verified</Option>
                </Select>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
