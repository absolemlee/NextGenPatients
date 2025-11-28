import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { getCurrentUserProfile } from "@/appWrite-client/auth-helpers";
import { databaseClient, DATABASE_ID, COLLECTIONS } from "@/appWrite-client/settings.config";
import { message, Modal, Button, Table, Tag, Space, DatePicker, Select } from "antd";
import { DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;

export default function AppointmentsManagement() {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [providers, setProviders] = useState([]);
  const [clients, setClients] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterProvider, setFilterProvider] = useState("all");
  const [dateRange, setDateRange] = useState(null);
  const router = useRouter();

  useEffect(() => {
    checkAuthAndLoadData();
  }, [router]);

  useEffect(() => {
    applyFilters();
  }, [appointments, filterStatus, filterProvider, dateRange]);

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
      // Load appointments
      const appointmentsRes = await databaseClient.listDocuments(
        DATABASE_ID,
        COLLECTIONS.APPOINTMENTS,
        []
      );
      setAppointments(appointmentsRes.documents);

      // Load providers
      const providersRes = await databaseClient.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DOCTORS
      );
      setProviders(providersRes.documents);

      // Load clients
      const clientsRes = await databaseClient.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PATIENTS
      );
      setClients(clientsRes.documents);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...appointments];

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(apt => apt.status === filterStatus);
    }

    // Filter by provider
    if (filterProvider !== "all") {
      filtered = filtered.filter(apt => apt.doctorId === filterProvider);
    }

    // Filter by date range
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf('day').toDate();
      const endDate = dateRange[1].endOf('day').toDate();
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate >= startDate && aptDate <= endDate;
      });
    }

    setFilteredAppointments(filtered);
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      await databaseClient.updateDocument(
        DATABASE_ID,
        COLLECTIONS.APPOINTMENTS,
        appointmentId,
        { status: newStatus }
      );
      message.success(`Appointment ${newStatus} successfully!`);
      await loadAllData();
    } catch (error) {
      console.error("Error updating appointment:", error);
      message.error("Failed to update appointment");
    }
  };

  const handleDelete = async (appointmentId) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this appointment?',
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await databaseClient.deleteDocument(
            DATABASE_ID,
            COLLECTIONS.APPOINTMENTS,
            appointmentId
          );
          message.success("Appointment deleted successfully!");
          await loadAllData();
        } catch (error) {
          console.error("Error deleting appointment:", error);
          message.error("Failed to delete appointment");
        }
      },
    });
  };

  const getProviderName = (providerId) => {
    const provider = providers.find(p => p.$id === providerId);
    return provider?.name || "Unknown Provider";
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.$id === clientId);
    return client?.name || "Unknown Client";
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "orange",
      confirmed: "blue",
      completed: "green",
      cancelled: "red",
    };
    return colors[status] || "default";
  };

  const columns = [
    {
      title: 'Date & Time',
      dataIndex: 'appointmentDate',
      key: 'appointmentDate',
      render: (date, record) => (
        <div>
          <div className="font-medium">{new Date(date).toLocaleDateString()}</div>
          <div className="text-xs text-gray-500">{record.appointmentTime || 'N/A'}</div>
        </div>
      ),
      sorter: (a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Client',
      dataIndex: 'patientId',
      key: 'patientId',
      render: (patientId) => getClientName(patientId),
    },
    {
      title: 'Provider',
      dataIndex: 'doctorId',
      key: 'doctorId',
      render: (doctorId) => getProviderName(doctorId),
    },
    {
      title: 'Service Type',
      dataIndex: 'specialty',
      key: 'specialty',
      render: (specialty) => specialty || 'General',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes) => (
        <div className="max-w-xs truncate" title={notes}>
          {notes || 'N/A'}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Space>
            {record.status === 'pending' && (
              <>
                <Button
                  size="small"
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleUpdateStatus(record.$id, 'confirmed')}
                  className="bg-blue-600"
                >
                  Confirm
                </Button>
                <Button
                  size="small"
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleUpdateStatus(record.$id, 'cancelled')}
                >
                  Cancel
                </Button>
              </>
            )}
            {record.status === 'confirmed' && (
              <Button
                size="small"
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleUpdateStatus(record.$id, 'completed')}
                className="bg-green-600"
              >
                Mark Complete
              </Button>
            )}
          </Space>
          <Button
            size="small"
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

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  return (
    <>
      <Head>
        <title>Appointments Management | Admin</title>
      </Head>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Appointments Management</h1>
              <p className="text-gray-600 mt-2">View and manage all appointments</p>
            </div>
            <div>
              <Link href="/admin/dashboard" className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700">
                Back to Dashboard
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Total</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Pending</h3>
              <p className="text-3xl font-bold text-orange-600 mt-2">{stats.pending}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Confirmed</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.confirmed}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Completed</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Cancelled</h3>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.cancelled}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h3 className="text-lg font-semibold mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Select
                  value={filterStatus}
                  onChange={setFilterStatus}
                  className="w-full"
                >
                  <Option value="all">All Statuses</Option>
                  <Option value="pending">Pending</Option>
                  <Option value="confirmed">Confirmed</Option>
                  <Option value="completed">Completed</Option>
                  <Option value="cancelled">Cancelled</Option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                <Select
                  value={filterProvider}
                  onChange={setFilterProvider}
                  className="w-full"
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  <Option value="all">All Providers</Option>
                  {providers.map(provider => (
                    <Option key={provider.$id} value={provider.$id}>
                      {provider.name}
                    </Option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <RangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  className="w-full"
                />
              </div>
            </div>
            {(filterStatus !== "all" || filterProvider !== "all" || dateRange) && (
              <Button
                onClick={() => {
                  setFilterStatus("all");
                  setFilterProvider("all");
                  setDateRange(null);
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Appointments Table */}
          <div className="bg-white rounded-lg shadow">
            <Table
              columns={columns}
              dataSource={filteredAppointments}
              rowKey="$id"
              pagination={{ pageSize: 10 }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
