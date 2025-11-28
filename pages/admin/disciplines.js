import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { getCurrentUserProfile } from "@/appWrite-client/auth-helpers";
import { databaseClient, DATABASE_ID, COLLECTIONS } from "@/appWrite-client/settings.config";
import { ID, Query } from "appwrite";
import { message, Modal, Input, Select, Button, Table, Tag, Space, Switch } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;

export default function DisciplinesManagement() {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [disciplines, setDisciplines] = useState([]);
  const [providers, setProviders] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDiscipline, setEditingDiscipline] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
    imageUrl: "",
    status: "active",
    licenseRequired: false,
    licenseType: "n/a",
    minCertificationLevel: "provider",
    leadProviderId: "",
    isPublic: false,
    isInternal: false,
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
      await loadDisciplines();
      await loadProviders();
      setLoading(false);
    } catch (error) {
      console.error("Auth error:", error);
      router.push('/login');
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
      // If collection doesn't exist yet, show empty state
      setDisciplines([]);
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

  const handleCreateOrUpdate = async () => {
    try {
      // Generate slug from name if not provided
      const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-');
      
      const licenseRequired = formData.licenseRequired === "true" || formData.licenseRequired === true;
      
      const disciplineData = {
        ...formData,
        slug,
        licenseRequired,
        // Ensure licenseType is always "n/a" when license is not required
        licenseType: licenseRequired ? formData.licenseType : "n/a",
      };

      if (editingDiscipline) {
        // Update existing discipline
        await databaseClient.updateDocument(
          DATABASE_ID,
          COLLECTIONS.DISCIPLINES,
          editingDiscipline.$id,
          disciplineData
        );
        message.success("Discipline updated successfully!");
      } else {
        // Create new discipline
        await databaseClient.createDocument(
          DATABASE_ID,
          COLLECTIONS.DISCIPLINES,
          ID.unique(),
          disciplineData
        );
        message.success("Discipline created successfully!");
      }

      setIsModalVisible(false);
      resetForm();
      await loadDisciplines();
    } catch (error) {
      console.error("Error saving discipline:", error);
      message.error(error.message || "Failed to save discipline. Make sure the 'disciplines' collection exists in Appwrite.");
    }
  };

  const handleEdit = (discipline) => {
    setEditingDiscipline(discipline);
    setFormData({
      name: discipline.name,
      description: discipline.description || "",
      slug: discipline.slug || "",
      imageUrl: discipline.imageUrl || "",
      status: discipline.status || "active",
      licenseRequired: discipline.licenseRequired || false,
      licenseType: discipline.licenseType || "n/a",
      minCertificationLevel: discipline.minCertificationLevel || "provider",
      leadProviderId: discipline.leadProviderId || "",
      isPublic: discipline.isPublic || false,
      isInternal: discipline.isInternal || false,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (disciplineId) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this discipline?',
      content: 'This action cannot be undone. All associated services will also be affected.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await databaseClient.deleteDocument(
            DATABASE_ID,
            COLLECTIONS.DISCIPLINES,
            disciplineId
          );
          message.success("Discipline deleted successfully!");
          await loadDisciplines();
        } catch (error) {
          console.error("Error deleting discipline:", error);
          message.error("Failed to delete discipline");
        }
      },
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      slug: "",
      imageUrl: "",
      status: "active",
      licenseRequired: false,
      licenseType: "n/a",
      minCertificationLevel: "provider",
      leadProviderId: "",
      isPublic: false,
      isInternal: false,
    });
    setEditingDiscipline(null);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div className="font-semibold">{text}</div>
          <div className="text-xs text-gray-500">{record.slug}</div>
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: '30%',
    },
    {
      title: 'Lead Provider',
      dataIndex: 'leadProviderId',
      key: 'leadProviderId',
      render: (leadId) => {
        const lead = providers.find(p => p.$id === leadId);
        return lead ? lead.name : 'Unassigned';
      },
    },
    {
      title: 'Min Certification',
      dataIndex: 'minCertificationLevel',
      key: 'minCertificationLevel',
      render: (level) => {
        const colors = {
          provider: 'blue',
          advanced: 'purple',
          master: 'gold',
          instructor: 'cyan',
          licensed: 'green',
          admin: 'red',
        };
        return <Tag color={colors[level] || 'default'}>{level?.toUpperCase() || 'PROVIDER'}</Tag>;
      },
    },
    {
      title: 'License Required',
      dataIndex: 'licenseRequired',
      key: 'licenseRequired',
      render: (required, record) => (
        <div>
          <Tag color={required ? 'orange' : 'green'}>
            {required ? 'Required' : 'Not Required'}
          </Tag>
          {required && record.licenseType && (
            <div className="text-xs text-gray-600 mt-1">{record.licenseType}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          active: 'green',
          inactive: 'gray',
          archived: 'red',
        };
        return <Tag color={colors[status]}>{status?.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Visibility',
      key: 'visibility',
      render: (_, record) => (
        <Space>
          {record.isPublic && <Tag color="blue">Public</Tag>}
          {record.isInternal && <Tag color="purple">Internal</Tag>}
          {!record.isPublic && !record.isInternal && <Tag>Admin Only</Tag>}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => router.push(`/admin/disciplines/${record.$id}`)}
          >
            View
          </Button>
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
        <title>Discipline Management | Admin</title>
      </Head>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Discipline Management</h1>
              <p className="text-gray-600 mt-2">Create, review, and certify all organizational disciplines</p>
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
                Create Discipline
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Total Disciplines</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{disciplines.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Active</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {disciplines.filter(d => d.status === 'active').length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Require License</h3>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {disciplines.filter(d => d.licenseRequired).length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Assigned Leads</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {disciplines.filter(d => d.leadProviderId).length}
              </p>
            </div>
          </div>

          {/* Disciplines Table */}
          <div className="bg-white rounded-lg shadow">
            <Table
              columns={columns}
              dataSource={disciplines}
              rowKey="$id"
              pagination={{ pageSize: 10 }}
              locale={{
                emptyText: (
                  <div className="py-12">
                    <p className="text-gray-500 mb-4">No disciplines yet. Create your first discipline to get started.</p>
                    <p className="text-sm text-gray-400">Note: You need to create a &apos;disciplines&apos; collection in Appwrite first.</p>
                  </div>
                ),
              }}
            />
          </div>
        </div>

        {/* Create/Edit Modal */}
        <Modal
          title={editingDiscipline ? "Edit Discipline" : "Create New Discipline"}
          open={isModalVisible}
          onOk={handleCreateOrUpdate}
          onCancel={() => {
            setIsModalVisible(false);
            resetForm();
          }}
          width={700}
          okText={editingDiscipline ? "Update" : "Create"}
          okButtonProps={{ className: "bg-[#2A9988]" }}
        >
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discipline Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Spiritual Counseling, Energy Healing"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <TextArea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the discipline and its purpose"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Slug (auto-generated if empty)
              </label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="spiritual-counseling"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <Input
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="/images/disciplines/spiritual-counseling.png"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                  <Option value="archived">Archived</Option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Certification Level
                </label>
                <Select
                  value={formData.minCertificationLevel}
                  onChange={(value) => setFormData({ ...formData, minCertificationLevel: value })}
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Required
              </label>
              <Select
                value={formData.licenseRequired.toString()}
                onChange={(value) => setFormData({ 
                  ...formData, 
                  licenseRequired: value,
                  // Set licenseType to n/a when license is not required
                  licenseType: value === "false" ? "n/a" : formData.licenseType
                })}
                className="w-full"
              >
                <Option value="false">No</Option>
                <Option value="true">Yes</Option>
              </Select>
            </div>

            {(formData.licenseRequired === true || formData.licenseRequired === "true") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  License Type *
                </label>
                <Select
                  value={formData.licenseType}
                  onChange={(value) => setFormData({ ...formData, licenseType: value })}
                  className="w-full"
                  placeholder="Select license type"
                >
                  <Option value="n/a">N/A</Option>
                  <Option value="permit">Permit</Option>
                  <Option value="mission">Mission</Option>
                  <Option value="clinic">Clinic</Option>
                  <Option value="patent">Patent</Option>
                  <Option value="license">License</Option>
                  <Option value="charter">Charter</Option>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Specify the type of official authorization required
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lead Provider
              </label>
              <Select
                value={formData.leadProviderId}
                onChange={(value) => setFormData({ ...formData, leadProviderId: value })}
                className="w-full"
                placeholder="Select a discipline lead"
                allowClear
              >
                {providers.map((provider) => (
                  <Option key={provider.$id} value={provider.$id}>
                    {provider.name} ({provider.email})
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Visibility Settings
              </label>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200">
                  <div>
                    <div className="font-medium text-gray-900">Public</div>
                    <p className="text-xs text-gray-600">Show in public directories (/specialists)</p>
                  </div>
                  <Switch
                    checked={formData.isPublic}
                    onChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded border border-purple-200">
                  <div>
                    <div className="font-medium text-gray-900">Internal Only</div>
                    <p className="text-xs text-gray-600">Visible only to providers (e.g., Admin, Support)</p>
                  </div>
                  <Switch
                    checked={formData.isInternal}
                    onChange={(checked) => setFormData({ ...formData, isInternal: checked })}
                  />
                </div>
                <p className="text-xs text-gray-500 italic">
                  If neither is selected, discipline is admin-only (not visible to public or general providers)
                </p>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
