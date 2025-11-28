import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { getCurrentUserProfile } from "@/appWrite-client/auth-helpers";
import { databaseClient, DATABASE_ID, COLLECTIONS } from "@/appWrite-client/settings.config";
import { ID } from "appwrite";
import { message, Modal, Input, Button, Table, Space, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from "@ant-design/icons";

const { TextArea } = Input;

export default function ClientsManagement() {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [clients, setClients] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    emergencyContact: "",
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
      await loadClients();
      setLoading(false);
    } catch (error) {
      console.error("Auth error:", error);
      router.push('/login');
    }
  };

  const loadClients = async () => {
    try {
      const response = await databaseClient.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PATIENTS
      );
      setClients(response.documents);
    } catch (error) {
      console.error("Error loading clients:", error);
    }
  };

  const handleCreateOrUpdate = async () => {
    try {
      if (editingClient) {
        await databaseClient.updateDocument(
          DATABASE_ID,
          COLLECTIONS.PATIENTS,
          editingClient.$id,
          formData
        );
        message.success("Client updated successfully!");
      } else {
        await databaseClient.createDocument(
          DATABASE_ID,
          COLLECTIONS.PATIENTS,
          ID.unique(),
          {
            ...formData,
            userId: "", // Set this if you have user account integration
          }
        );
        message.success("Client created successfully!");
      }

      setIsModalVisible(false);
      resetForm();
      await loadClients();
    } catch (error) {
      console.error("Error saving client:", error);
      message.error(error.message || "Failed to save client");
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone || "",
      address: client.address || "",
      emergencyContact: client.emergencyContact || "",
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (clientId) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this client?',
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await databaseClient.deleteDocument(
            DATABASE_ID,
            COLLECTIONS.PATIENTS,
            clientId
          );
          message.success("Client deleted successfully!");
          await loadClients();
        } catch (error) {
          console.error("Error deleting client:", error);
          message.error("Failed to delete client");
        }
      },
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      emergencyContact: "",
    });
    setEditingClient(null);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => (
        <div className="flex items-center">
          <UserOutlined className="mr-2 text-gray-400" />
          {text}
        </div>
      ),
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
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      render: (address) => address || 'N/A',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Emergency Contact',
      dataIndex: 'emergencyContact',
      key: 'emergencyContact',
      render: (contact) => contact || 'N/A',
    },
    {
      title: 'Registered',
      dataIndex: '$createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.$createdAt) - new Date(b.$createdAt),
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
        <title>Client Management | Admin</title>
      </Head>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Client Management</h1>
              <p className="text-gray-600 mt-2">Manage all client profiles and information</p>
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
                Add Client
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Total Clients</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{clients.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">New This Month</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {clients.filter(c => {
                  const createdDate = new Date(c.$createdAt);
                  const now = new Date();
                  return createdDate.getMonth() === now.getMonth() && 
                         createdDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">With Emergency Contact</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {clients.filter(c => c.emergencyContact).length}
              </p>
            </div>
          </div>

          {/* Clients Table */}
          <div className="bg-white rounded-lg shadow">
            <Table
              columns={columns}
              dataSource={clients}
              rowKey="$id"
              pagination={{ pageSize: 10 }}
            />
          </div>
        </div>

        {/* Create/Edit Modal */}
        <Modal
          title={editingClient ? "Edit Client" : "Add New Client"}
          open={isModalVisible}
          onOk={handleCreateOrUpdate}
          onCancel={() => {
            setIsModalVisible(false);
            resetForm();
          }}
          width={700}
          okText={editingClient ? "Update" : "Create"}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <TextArea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full address"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
              <Input
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                placeholder="Name and phone number"
              />
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
