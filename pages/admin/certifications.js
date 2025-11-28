import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { getCurrentUserProfile } from "@/appWrite-client/auth-helpers";
import { databaseClient, DATABASE_ID, COLLECTIONS } from "@/appWrite-client/settings.config";
import { ID, Query } from "appwrite";
import { message, Modal, Select, Button, Table, Tag, Space } from "antd";
import { PlusOutlined, DeleteOutlined, CheckCircleOutlined } from "@ant-design/icons";

const { Option } = Select;

// Enums from DISCIPLINE_ARCHITECTURE.md
const CERTIFICATION_LEVELS = [
  "Foundational",
  "Intermediate",
  "Advanced",
  "Expert",
  "Master",
  "Grandmaster"
];

const PROVIDER_ROLES = [
  "Lead Provider",
  "Senior Provider",
  "Provider",
  "Associate Provider",
  "Assistant Provider",
  "Trainee Provider",
  "Consultant",
  "Specialist Consultant",
  "Advisor",
  "Guest Provider",
  "Researcher",
  "Instructor",
  "Administrator",
  "Support Staff"
];

export default function ProviderCertifications() {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [providers, setProviders] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [services, setServices] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    providerId: "",
    disciplineId: "",
    role: "Provider",
    certificationLevel: "Foundational",
    serviceIds: [],
    isActive: true,
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
      await loadAllData();
      setLoading(false);
    } catch (error) {
      console.error("Auth error:", error);
      router.push('/login');
    }
  };

  const loadAllData = async () => {
    try {
      // Load providers
      const providersRes = await databaseClient.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DOCTORS
      );
      setProviders(providersRes.documents);

      // Load disciplines
      const disciplinesRes = await databaseClient.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DISCIPLINES
      );
      setDisciplines(disciplinesRes.documents);

      // Load certifications
      const certificationsRes = await databaseClient.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PROVIDER_DISCIPLINES
      );
      setCertifications(certificationsRes.documents);

      // Load all services
      const servicesRes = await databaseClient.listDocuments(
        DATABASE_ID,
        COLLECTIONS.SERVICES
      );
      setServices(servicesRes.documents);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleCreate = async () => {
    try {
      if (!formData.providerId || !formData.disciplineId) {
        message.error("Please select both provider and discipline");
        return;
      }

      await databaseClient.createDocument(
        DATABASE_ID,
        COLLECTIONS.PROVIDER_DISCIPLINES,
        ID.unique(),
        {
          providerId: formData.providerId,
          disciplineId: formData.disciplineId,
          role: formData.role,
          certificationLevel: formData.certificationLevel,
          serviceIds: formData.serviceIds,
          isActive: formData.isActive,
        }
      );

      message.success("Provider certification created successfully!");
      setIsModalVisible(false);
      resetForm();
      await loadAllData();
    } catch (error) {
      console.error("Error creating certification:", error);
      message.error(error.message || "Failed to create certification");
    }
  };

  const handleDelete = async (certId) => {
    Modal.confirm({
      title: 'Are you sure you want to remove this certification?',
      content: 'The provider will lose access to this discipline.',
      okText: 'Remove',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await databaseClient.deleteDocument(
            DATABASE_ID,
            COLLECTIONS.PROVIDER_DISCIPLINES,
            certId
          );
          message.success("Certification removed successfully!");
          await loadAllData();
        } catch (error) {
          console.error("Error deleting certification:", error);
          message.error("Failed to remove certification");
        }
      },
    });
  };

  const toggleActive = async (cert) => {
    try {
      await databaseClient.updateDocument(
        DATABASE_ID,
        COLLECTIONS.PROVIDER_DISCIPLINES,
        cert.$id,
        { isActive: !cert.isActive }
      );
      message.success(`Certification ${!cert.isActive ? 'activated' : 'deactivated'} successfully!`);
      await loadAllData();
    } catch (error) {
      console.error("Error updating certification:", error);
      message.error("Failed to update certification");
    }
  };

  const resetForm = () => {
    setFormData({
      providerId: "",
      disciplineId: "",
      role: "Provider",
      certificationLevel: "Foundational",
      serviceIds: [],
      isActive: true,
    });
  };

  const getProviderName = (providerId) => {
    const provider = providers.find(p => p.$id === providerId);
    return provider?.name || "Unknown";
  };

  const getDisciplineName = (disciplineId) => {
    const discipline = disciplines.find(d => d.$id === disciplineId);
    return discipline?.name || "Unknown";
  };

  const getServiceNamesForDiscipline = (disciplineId) => {
    return services.filter(s => s.disciplineId === disciplineId);
  };

  const columns = [
    {
      title: 'Provider',
      dataIndex: 'providerId',
      key: 'providerId',
      render: (providerId) => getProviderName(providerId),
      sorter: (a, b) => getProviderName(a.providerId).localeCompare(getProviderName(b.providerId)),
    },
    {
      title: 'Discipline',
      dataIndex: 'disciplineId',
      key: 'disciplineId',
      render: (disciplineId) => getDisciplineName(disciplineId),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color="blue">{role}</Tag>
      ),
    },
    {
      title: 'Certification Level',
      dataIndex: 'certificationLevel',
      key: 'certificationLevel',
      render: (level) => {
        const colors = {
          "Foundational": "orange",
          "Intermediate": "gold",
          "Advanced": "green",
          "Expert": "cyan",
          "Master": "blue",
          "Grandmaster": "purple",
        };
        return <Tag color={colors[level] || "default"}>{level}</Tag>;
      },
    },
    {
      title: 'Service Permissions',
      dataIndex: 'serviceIds',
      key: 'serviceIds',
      render: (serviceIds) => serviceIds?.length || 0,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive, record) => (
        <Button
          size="small"
          type={isActive ? "default" : "primary"}
          icon={<CheckCircleOutlined />}
          onClick={() => toggleActive(record)}
          className={isActive ? "bg-green-50" : ""}
        >
          {isActive ? 'Active' : 'Inactive'}
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
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.$id)}
          >
            Remove
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
        <title>Provider Certifications | Admin</title>
      </Head>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Provider Certifications</h1>
              <p className="text-gray-600 mt-2">Manage provider discipline certifications and service permissions</p>
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
                Add Certification
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Total Certifications</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{certifications.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Active Certifications</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {certifications.filter(c => c.isActive).length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Certified Providers</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {new Set(certifications.map(c => c.providerId)).size}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Active Disciplines</h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {new Set(certifications.map(c => c.disciplineId)).size}
              </p>
            </div>
          </div>

          {/* Certifications Table */}
          <div className="bg-white rounded-lg shadow">
            <Table
              columns={columns}
              dataSource={certifications}
              rowKey="$id"
              pagination={{ pageSize: 10 }}
            />
          </div>
        </div>

        {/* Create Modal */}
        <Modal
          title="Add Provider Certification"
          open={isModalVisible}
          onOk={handleCreate}
          onCancel={() => {
            setIsModalVisible(false);
            resetForm();
          }}
          width={700}
          okText="Create"
          okButtonProps={{ className: "bg-[#2A9988]" }}
        >
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provider *</label>
              <Select
                value={formData.providerId}
                onChange={(value) => setFormData({ ...formData, providerId: value })}
                className="w-full"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                <Option value="">Select Provider</Option>
                {providers.map(provider => (
                  <Option key={provider.$id} value={provider.$id}>
                    {provider.name} ({provider.email})
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discipline *</label>
              <Select
                value={formData.disciplineId}
                onChange={(value) => setFormData({ ...formData, disciplineId: value, serviceIds: [] })}
                className="w-full"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                <Option value="">Select Discipline</Option>
                {disciplines.map(discipline => (
                  <Option key={discipline.$id} value={discipline.$id}>
                    {discipline.name}
                  </Option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <Select
                  value={formData.role}
                  onChange={(value) => setFormData({ ...formData, role: value })}
                  className="w-full"
                >
                  {PROVIDER_ROLES.map(role => (
                    <Option key={role} value={role}>{role}</Option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certification Level</label>
                <Select
                  value={formData.certificationLevel}
                  onChange={(value) => setFormData({ ...formData, certificationLevel: value })}
                  className="w-full"
                >
                  {CERTIFICATION_LEVELS.map(level => (
                    <Option key={level} value={level}>{level}</Option>
                  ))}
                </Select>
              </div>
            </div>

            {formData.disciplineId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Permissions (Optional)
                </label>
                <Select
                  mode="multiple"
                  value={formData.serviceIds}
                  onChange={(value) => setFormData({ ...formData, serviceIds: value })}
                  className="w-full"
                  placeholder="Select services this provider can offer"
                >
                  {getServiceNamesForDiscipline(formData.disciplineId).map(service => (
                    <Option key={service.$id} value={service.$id}>
                      {service.name} ({service.serviceType})
                    </Option>
                  ))}
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to allow all services in this discipline
                </p>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </>
  );
}
