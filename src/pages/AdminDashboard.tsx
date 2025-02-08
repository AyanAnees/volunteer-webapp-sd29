import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FaUsers, 
  FaCalendarAlt, 
  FaClipboardList, 
  FaStar, 
  FaSearch, 
  FaEdit, 
  FaTrash,
  FaFileAlt,
  FaFileCsv,
  FaFilePdf,
  FaCheck
} from 'react-icons/fa';
import { supabase, hasRole } from '../lib/supabase';
import { theme } from '../styles/theme';
import {
  Container,
  Title,
  Card,
  FormGroup,
  Label,
  Input,
  Select,
  TextArea,
  PrimaryButton,
  SecondaryButton,
  Flex,
  Grid,
  Badge
} from '../components/ui/StyledComponents';

// Styled Components
const AdminContainer = styled(Container)`
  padding-top: ${theme.spacing.xl};
  padding-bottom: ${theme.spacing.xl};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xl};
  
  @media (max-width: ${theme.breakpoints.lg}) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 10px;
  background-color: ${theme.colors.primary}20;
  color: ${theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: ${theme.fontSizes['2xl']};
  font-weight: bold;
`;

const StatLabel = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.gray[600]};
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${theme.colors.gray[200]};
  margin-bottom: ${theme.spacing.lg};
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const Tab = styled.button<{ active: boolean }>`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.active ? theme.colors.primary : 'transparent'};
  color: ${props => props.active ? theme.colors.primary : theme.colors.gray[700]};
  font-weight: ${props => props.active ? 600 : 400};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    color: ${theme.colors.primary};
  }
`;

const SearchBar = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  
  @media (max-width: ${theme.breakpoints.md}) {
    flex-direction: column;
  }
`;

const SearchInput = styled.div`
  position: relative;
  flex: 1;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: ${theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.gray[400]};
`;

const StyledInput = styled(Input)`
  padding-left: 2.5rem;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  margin-bottom: ${theme.spacing.xl};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: ${theme.spacing.md};
  border-bottom: 2px solid ${theme.colors.gray[200]};
  font-weight: 600;
  color: ${theme.colors.gray[700]};
`;

const Td = styled.td`
  padding: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.gray[200]};
`;

const UserRow = styled.tr`
  &:hover {
    background-color: ${theme.colors.gray[50]};
  }
`;

const EventRow = styled.tr`
  &:hover {
    background-color: ${theme.colors.gray[50]};
  }
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary};
  cursor: pointer;
  padding: ${theme.spacing.xs};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${theme.colors.primaryHover};
  }
`;

const DeleteButton = styled(ActionButton)`
  color: ${theme.colors.error};
  
  &:hover {
    color: ${theme.colors.error}dd;
  }
`;

const StatusBadge = styled(Badge)<{ status: string }>`
  text-transform: capitalize;
  background-color: ${props => {
    switch (props.status) {
      case 'active': return theme.colors.success;
      case 'inactive': return theme.colors.gray[500];
      case 'suspended': return theme.colors.error;
      default: return theme.colors.gray[500];
    }
  }};
`;

const EventStatusBadge = styled(Badge)<{ status: string }>`
  text-transform: capitalize;
  background-color: ${props => {
    switch (props.status) {
      case 'draft': return theme.colors.gray[500];
      case 'published': return theme.colors.success;
      case 'canceled': return theme.colors.error;
      case 'completed': return theme.colors.info;
      default: return theme.colors.gray[500];
    }
  }};
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled(Card)`
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
  padding-bottom: ${theme.spacing.sm};
  border-bottom: 1px solid ${theme.colors.gray[200]};
`;

const ModalTitle = styled.h3`
  font-size: ${theme.fontSizes.xl};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: ${theme.fontSizes.xl};
  color: ${theme.colors.gray[500]};
  cursor: pointer;
  
  &:hover {
    color: ${theme.colors.gray[700]};
  }
`;

// Report related styled components
const ReportCard = styled(Card)`
  margin-bottom: ${theme.spacing.lg};
`;

const ReportTitle = styled.h3`
  font-size: ${theme.fontSizes.lg};
  margin-bottom: ${theme.spacing.md};
  font-weight: 600;
  color: ${theme.colors.gray[800]};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const ReportDescription = styled.p`
  color: ${theme.colors.gray[600]};
  margin-bottom: ${theme.spacing.md};
`;

const DateRangeContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const FormatButtonsContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
`;

const FormatButton = styled(SecondaryButton)<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  background-color: ${props => props.active ? theme.colors.primary : 'white'};
  color: ${props => props.active ? 'white' : theme.colors.primary};
  border-color: ${theme.colors.primary};
  
  &:hover {
    background-color: ${props => props.active ? theme.colors.primaryHover : theme.colors.primary}10;
  }
`;

const ReportPreviewTable = styled.div`
  margin-top: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.gray[50]};
  border-radius: ${theme.borderRadius.md};
  border: 1px dashed ${theme.colors.gray[300]};
`;

const StyledFlex = styled.div<{
  $justify?: string;
  $align?: string;
  $gap?: string;
  $direction?: string;
  $wrap?: string;
}>`
  display: flex;
  justify-content: ${props => props.$justify || 'flex-start'};
  align-items: ${props => props.$align || 'stretch'};
  gap: ${props => props.$gap || '0'};
  flex-direction: ${props => props.$direction || 'row'};
  flex-wrap: ${props => props.$wrap || 'nowrap'};
`;

const StyledGrid = styled.div<{
  $columns?: number;
  $gap?: string;
}>`
  display: grid;
  grid-template-columns: repeat(${props => props.$columns || 1}, 1fr);
  gap: ${props => props.$gap || theme.spacing.md};
`;

const FormTitle = styled.h3`
  font-size: ${theme.fontSizes.lg};
  margin-bottom: ${theme.spacing.md};
  font-weight: 600;
  color: ${theme.colors.gray[800]};
`;

interface User {
  id: string;
  created_at: string;
  email: string;
  display_name: string;
  type: string;
  profile_image_url?: string;
  status: string;
}

interface Event {
  id: string;
  title: string;
  creator_id: string;
  creator: {
    display_name: string;
  };
  status: string;
  start_datetime: string;
  max_volunteers?: number;
  applications_count: number;
}

interface Stat {
  title: string;
  value: number;
  icon: React.ReactNode;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [eventStatusFilter, setEventStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState({
    display_name: '',
    email: '',
    type: '',
    status: ''
  });
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'user' | 'event', name: string} | null>(null);
  
  // Report states
  const [reportType, setReportType] = useState('volunteer_participation');
  const [reportFormat, setReportFormat] = useState('pdf');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Notification states
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('info');
  const [notificationRecipients, setNotificationRecipients] = useState('all');
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  
  const [stats, setStats] = useState<Stat[]>([
    { title: 'Total Users', value: 0, icon: <FaUsers /> },
    { title: 'Active Events', value: 0, icon: <FaCalendarAlt /> },
    { title: 'Applications', value: 0, icon: <FaClipboardList /> },
    { title: 'Avg. Match Score', value: 0, icon: <FaStar /> }
  ]);

  // Check admin access and load data
  useEffect(() => {
    const init = async () => {
      try {
        const isOrganization = await hasRole('organization');
        
        if (!isOrganization) {
          alert('You do not have permission to access the organization dashboard.');
          navigate('/');
          return;
        }
        
        await Promise.all([
          loadUsers(),
          loadEvents(),
          loadStats()
        ]);
      } catch (error) {
        console.error('Error initializing organization dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    init();
  }, [navigate]);

  const loadUsers = async () => {
    try {
      // Get all users with profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          created_at,
          display_name,
          type,
          profile_image_url,
          status
        `);
      
      if (error) throw error;
      
      // Don't try to access admin APIs - this causes the AuthApiError
      // Simply use the profiles data and don't try to get emails from auth
      setUsers(profiles.map(profile => ({
        ...profile,
        email: 'Email hidden for privacy', // Placeholder for missing emails
        status: profile.status || 'active'
      })));
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadEvents = async () => {
    try {
      // Get all events with creator info and application counts
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          creator:profiles!creator_id(display_name),
          applications(count)
        `);
      
      if (error) throw error;
      
      // Process the data
      const processedEvents = data.map((event: any) => ({
        ...event,
        applications_count: event.applications?.length || 0
      }));
      
      setEvents(processedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadStats = async () => {
    try {
      // Calculate statistics
      const userCount = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const activeEventCount = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');
      const applicationCount = await supabase.from('applications').select('*', { count: 'exact', head: true });
      
      // Calculate average match score
      const { data: matchScores, error: matchError } = await supabase
        .from('applications')
        .select('match_score');
      
      let avgMatchScore = 0;
      if (!matchError && matchScores && matchScores.length > 0) {
        const sum = matchScores.reduce((acc, app) => acc + (app.match_score || 0), 0);
        avgMatchScore = Math.round(sum / matchScores.length);
      }
      
      setStats([
        { title: 'Total Users', value: userCount.count || 0, icon: <FaUsers /> },
        { title: 'Active Events', value: activeEventCount.count || 0, icon: <FaCalendarAlt /> },
        { title: 'Applications', value: applicationCount.count || 0, icon: <FaClipboardList /> },
        { title: 'Avg. Match Score', value: avgMatchScore, icon: <FaStar /> }
      ]);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setUserFormData({
      display_name: user.display_name,
      email: user.email,
      type: user.type,
      status: user.status
    });
    setIsEditModalOpen(true);
  };

  const handleSaveUser = async () => {
    if (!currentUser) return;
    
    try {
      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: userFormData.display_name,
          type: userFormData.type,
          status: userFormData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);
      
      if (error) throw error;
      
      // Refresh users list
      await loadUsers();
      
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    }
  };

  const handleDeleteItem = (id: string, type: 'user' | 'event', name: string) => {
    setItemToDelete({ id, type, name });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      if (itemToDelete.type === 'user') {
        // Delete user profile
        await supabase
          .from('profiles')
          .delete()
          .eq('id', itemToDelete.id);
        
        // In a real app, would need admin API to delete auth user
        
        // Refresh users
        await loadUsers();
      } else {
        // Delete event and related records
        await supabase.from('event_skills').delete().eq('event_id', itemToDelete.id);
        await supabase.from('applications').delete().eq('event_id', itemToDelete.id);
        await supabase.from('events').delete().eq('id', itemToDelete.id);
        
        // Refresh events
        await loadEvents();
      }
      
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => 
    (userTypeFilter === 'all' || user.type === userTypeFilter) &&
    (user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Filter events based on search and filters
  const filteredEvents = events.filter(event => 
    (eventStatusFilter === 'all' || event.status === eventStatusFilter) &&
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort events based on selected option
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.start_datetime).getTime() - new Date(a.start_datetime).getTime();
    } else if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    } else {
      return 0;
    }
  });

  // Set default date range to the last 30 days when the reports tab is selected
  useEffect(() => {
    if (activeTab === 'reports') {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
    }
  }, [activeTab]);

  // Generate and download report
  const generateReport = async () => {
    if (!startDate || !endDate) {
      alert('Please select a valid date range');
      return;
    }
    
    setIsGeneratingReport(true);
    
    try {
      // Fetch data for the selected report type
      let reportData;
      
      if (reportType === 'volunteer_participation') {
        // Fix the query to work with your database schema
        // Get volunteer participation data from Supabase
        const { data: applicationData, error } = await supabase
          .from('applications')
          .select(`
            id,
            volunteer_id,
            event_id,
            status,
            created_at
          `)
          .gte('created_at', `${startDate}T00:00:00`)
          .lte('created_at', `${endDate}T23:59:59`);
        
        if (error) throw error;
        
        // Get profiles and events separately to avoid foreign key issues
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name');
          
        if (profilesError) throw profilesError;
        
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('id, title, start_datetime');
          
        if (eventsError) throw eventsError;
        
        // Transform data for the report
        const volunteersMap = new Map();
        
        // Process application data with manual joins
        applicationData.forEach(application => {
          const volunteerProfile = profilesData.find(p => p.id === application.volunteer_id);
          const event = eventsData.find(e => e.id === application.event_id);
          
          if (!volunteerProfile || !event) return;
          
          const eventInfo = `${event.title} (${new Date(event.start_datetime).toLocaleDateString()})`;
          
          if (!volunteersMap.has(application.volunteer_id)) {
            volunteersMap.set(application.volunteer_id, {
              name: volunteerProfile.display_name,
              email: 'Email hidden for privacy', // We don't have access to emails
              events: [eventInfo]
            });
          } else {
            const volunteerData = volunteersMap.get(application.volunteer_id);
            if (!volunteerData.events.includes(eventInfo)) {
              volunteerData.events.push(eventInfo);
            }
          }
        });
        
        reportData = Array.from(volunteersMap.values());
      } else if (reportType === 'event_details') {
        // Get event details data from Supabase
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select(`
            id,
            title,
            description,
            start_datetime,
            end_datetime,
            location,
            creator_id,
            status
          `)
          .gte('start_datetime', `${startDate}T00:00:00`)
          .lte('start_datetime', `${endDate}T23:59:59`);
        
        if (eventsError) throw eventsError;
        
        // Get applications and profiles separately to avoid foreign key issues
        const { data: applicationsData, error: applicationsError } = await supabase
          .from('applications')
          .select('id, event_id, volunteer_id, status')
          .eq('status', 'accepted');
          
        if (applicationsError) throw applicationsError;
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name');
          
        if (profilesError) throw profilesError;
        
        // Get volunteers for each event with manual joins
        reportData = eventsData.map(event => {
          const acceptedApplications = applicationsData.filter(app => app.event_id === event.id);
          
          const volunteers = acceptedApplications.map(app => {
            const volunteer = profilesData.find(p => p.id === app.volunteer_id);
            return volunteer ? `${volunteer.display_name} (Email hidden)` : 'Unknown Volunteer';
          }).filter(Boolean);
          
          return {
            ...event,
            volunteers
          };
        });
      }
      
      // Generate CSV or PDF file
      if (reportFormat === 'csv') {
        downloadCSV(reportData || [], reportType);
      } else {
        downloadPDF(reportData || [], reportType);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Convert data to CSV and trigger download
  const downloadCSV = (data: any[], type: string) => {
    try {
      let csvContent = '';
      let filename = '';
      
      if (type === 'volunteer_participation') {
        // CSV header
        csvContent = 'Name,Email,Events Participated\n';
        
        // CSV rows
        data.forEach(volunteer => {
          csvContent += `"${volunteer.name}","${volunteer.email}","${volunteer.events.join('; ')}"\n`;
        });
        
        filename = `volunteer_participation_${startDate}_to_${endDate}.csv`;
      } else {
        // CSV header
        csvContent = 'Event Name,Date,Description,Location,Status,Volunteers\n';
        
        // CSV rows
        data.forEach(event => {
          csvContent += `"${event.title}","${new Date(event.start_datetime).toLocaleDateString()}","${event.description || ''}","${event.location || ''}","${event.status || 'Unknown'}","${event.volunteers.join('; ') || 'None'}"\n`;
        });
        
        filename = `event_details_${startDate}_to_${endDate}.csv`;
      }
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error creating CSV file:', error);
      alert('Failed to generate CSV file. Please try again.');
    }
  };

  // Generate PDF and trigger download
  const downloadPDF = async (data: any[], type: string) => {
    // For PDF generation, we'll use client-side libraries
    // In a real implementation, you might want to use a server-side approach or a service
    // Here we'll use a stub that creates a simple HTML table and uses browser printing
    try {
      // Create a hidden iframe for PDF printing
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      if (!iframe.contentWindow) {
        throw new Error('Could not access iframe content window');
      }
      
      // Create content for the iframe
      let html = `
        <html>
        <head>
          <title>${type === 'volunteer_participation' ? 'Volunteer Participation Report' : 'Event Details Report'}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th { background-color: #f2f2f2; text-align: left; padding: 8px; }
            td { padding: 8px; border-bottom: 1px solid #ddd; }
            h1 { text-align: center; }
            .subtitle { text-align: center; color: #666; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>${type === 'volunteer_participation' ? 'Volunteer Participation Report' : 'Event Details Report'}</h1>
          <p class="subtitle">Report period: ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}</p>
          <table>
            <thead>
              <tr>
      `;
      
      if (type === 'volunteer_participation') {
        html += '<th>Volunteer Name</th><th>Email</th><th>Events Participated</th>';
      } else {
        html += '<th>Event Name</th><th>Date</th><th>Location</th><th>Status</th><th>Volunteers</th>';
      }
      
      html += `
              </tr>
            </thead>
            <tbody>
      `;
      
      if (type === 'volunteer_participation') {
        data.forEach(volunteer => {
          html += `
            <tr>
              <td>${volunteer.name}</td>
              <td>${volunteer.email}</td>
              <td>${volunteer.events.join('<br>')}</td>
            </tr>
          `;
        });
      } else {
        data.forEach(event => {
          html += `
            <tr>
              <td>${event.title}</td>
              <td>${new Date(event.start_datetime).toLocaleDateString()}</td>
              <td>${event.location || 'Not specified'}</td>
              <td>${event.status || 'Unknown'}</td>
              <td>${event.volunteers.join('<br>') || 'No volunteers'}</td>
            </tr>
          `;
        });
      }
      
      html += `
            </tbody>
          </table>
        </body>
        </html>
      `;
      
      // Write to the iframe and trigger print
      iframe.contentWindow.document.open();
      iframe.contentWindow.document.write(html);
      iframe.contentWindow.document.close();
      
      // Wait for the content to load, then print
      iframe.onload = function() {
        setTimeout(() => {
          if (iframe.contentWindow) {
            iframe.contentWindow.print();
          }
          // Remove the iframe after printing
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        }, 500);
      };
    } catch (error) {
      console.error('Error creating PDF file:', error);
      alert('Failed to generate PDF file. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <Container>
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <p>Loading organization dashboard...</p>
        </div>
      </Container>
    );
  }

  return (
    <AdminContainer>
      <Title>Organization Dashboard</Title>
      
      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard key={index}>
            <StatIcon>
              {stat.icon}
            </StatIcon>
            <StatContent>
              <StatValue>{stat.value}</StatValue>
              <StatLabel>{stat.title}</StatLabel>
            </StatContent>
          </StatCard>
        ))}
      </StatsGrid>
      
      <TabsContainer>
        <Tab 
          active={activeTab === 'users'} 
          onClick={() => setActiveTab('users')}
        >
          User Management
        </Tab>
        <Tab 
          active={activeTab === 'events'} 
          onClick={() => setActiveTab('events')}
        >
          Event Management
        </Tab>
        <Tab 
          active={activeTab === 'reports'} 
          onClick={() => setActiveTab('reports')}
        >
          Reports
        </Tab>
        <Tab 
          active={activeTab === 'notifications'} 
          onClick={() => setActiveTab('notifications')}
        >
          Send Notifications
        </Tab>
      </TabsContainer>
      
      {activeTab === 'users' && (
        <>
          <SearchBar>
            <SearchInput>
              <SearchIcon>
                <FaSearch />
              </SearchIcon>
              <StyledInput
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchInput>
            
            <FilterContainer>
              <Select
                value={userTypeFilter}
                onChange={(e) => setUserTypeFilter(e.target.value)}
                style={{ minWidth: '150px' }}
              >
                <option value="all">All Types</option>
                <option value="volunteer">Volunteers</option>
                <option value="organization">Organizations</option>
                <option value="admin">Admins</option>
              </Select>
            </FilterContainer>
          </SearchBar>
          
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Type</Th>
                  <Th>Joined</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <UserRow key={user.id}>
                      <Td>{user.display_name}</Td>
                      <Td>{user.email}</Td>
                      <Td style={{ textTransform: 'capitalize' }}>{user.type}</Td>
                      <Td>{formatDate(user.created_at)}</Td>
                      <Td>
                        <StatusBadge status={user.status || 'active'}>
                          {user.status || 'active'}
                        </StatusBadge>
                      </Td>
                      <Td>
                        <Flex gap="8px">
                          <ActionButton onClick={() => handleEditUser(user)}>
                            <FaEdit />
                          </ActionButton>
                          <DeleteButton onClick={() => handleDeleteItem(user.id, 'user', user.display_name)}>
                            <FaTrash />
                          </DeleteButton>
                        </Flex>
                      </Td>
                    </UserRow>
                  ))
                ) : (
                  <tr>
                    <Td colSpan={6} style={{ textAlign: 'center' }}>No users found with the selected filters.</Td>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableContainer>
        </>
      )}
      
      {activeTab === 'events' && (
        <>
          <SearchBar>
            <SearchInput>
              <SearchIcon>
                <FaSearch />
              </SearchIcon>
              <StyledInput
                placeholder="Search events by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchInput>
            
            <FilterContainer>
              <Select
                value={eventStatusFilter}
                onChange={(e) => setEventStatusFilter(e.target.value)}
                style={{ minWidth: '150px' }}
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
              </Select>
              
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ minWidth: '150px' }}
              >
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Title</option>
              </Select>
            </FilterContainer>
          </SearchBar>
          
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <Th>Event Title</Th>
                  <Th>Organizer</Th>
                  <Th>Date</Th>
                  <Th>Status</Th>
                  <Th>Applications</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {sortedEvents.length > 0 ? (
                  sortedEvents.map(event => (
                    <EventRow key={event.id}>
                      <Td>{event.title}</Td>
                      <Td>{event.creator?.display_name || 'Unknown'}</Td>
                      <Td>{formatDate(event.start_datetime)}</Td>
                      <Td>
                        <EventStatusBadge status={event.status}>
                          {event.status}
                        </EventStatusBadge>
                      </Td>
                      <Td>{event.applications_count} / {event.max_volunteers || '∞'}</Td>
                      <Td>
                        <Flex gap="8px">
                          <ActionButton onClick={() => navigate(`/opportunities/${event.id}`)}>
                            <FaCheck />
                          </ActionButton>
                          <DeleteButton onClick={() => handleDeleteItem(event.id, 'event', event.title)}>
                            <FaTrash />
                          </DeleteButton>
                        </Flex>
                      </Td>
                    </EventRow>
                  ))
                ) : (
                  <tr>
                    <Td colSpan={6} style={{ textAlign: 'center' }}>No events found with the selected filters.</Td>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableContainer>
        </>
      )}
      
      {activeTab === 'reports' && (
        <>
          <ReportCard>
            <ReportTitle>
              <FaFileAlt />
              Generate Reports
            </ReportTitle>
            <ReportDescription>
              Generate reports about volunteer participation and event details.
              Select the report type, date range, and format to download.
            </ReportDescription>
            
            <FormGroup>
              <Label>Report Type</Label>
              <Select 
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="volunteer_participation">Volunteer Participation Report</option>
                <option value="event_details">Event Details Report</option>
              </Select>
              <p style={{ fontSize: '0.8rem', color: theme.colors.gray[600], marginTop: '4px' }}>
                {reportType === 'volunteer_participation' ? 
                  'Shows which volunteers participated in which events, with details on volunteer information and event participation.' :
                  'Shows details about events including description, location, status, and participating volunteers.'}
              </p>
            </FormGroup>
            
            <FormGroup>
              <Label>Date Range</Label>
              <DateRangeContainer>
                <div>
                  <Label htmlFor="start_date" style={{ fontSize: '0.85rem' }}>Start Date</Label>
                  <Input 
                    id="start_date"
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="end_date" style={{ fontSize: '0.85rem' }}>End Date</Label>
                  <Input 
                    id="end_date"
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </DateRangeContainer>
            </FormGroup>
            
            <FormGroup>
              <Label>Report Format</Label>
              <FormatButtonsContainer>
                <FormatButton 
                  active={reportFormat === 'pdf'} 
                  onClick={() => setReportFormat('pdf')}
                >
                  <FaFilePdf /> PDF Format
                </FormatButton>
                <FormatButton 
                  active={reportFormat === 'csv'} 
                  onClick={() => setReportFormat('csv')}
                >
                  <FaFileCsv /> CSV Format
                </FormatButton>
              </FormatButtonsContainer>
            </FormGroup>
            
            <Flex justify="flex-end" style={{ marginTop: theme.spacing.lg }}>
              <PrimaryButton 
                onClick={generateReport}
                disabled={isGeneratingReport || !startDate || !endDate}
              >
                {isGeneratingReport ? 'Generating...' : 'Generate Report'}
              </PrimaryButton>
            </Flex>
          </ReportCard>
          
          <StyledGrid $columns={2} $gap={theme.spacing.lg}>
            <ReportCard>
              <ReportTitle>
                <FaCalendarAlt />
                Volunteer Participation Report
              </ReportTitle>
              <ReportDescription>
                Shows which volunteers participated in which events, including volunteer contact information and a list of events they were assigned to or participated in.
              </ReportDescription>
              <ReportPreviewTable>
                <p><strong>Includes data:</strong></p>
                <ul>
                  <li>Volunteer name</li>
                  <li>Volunteer email</li>
                  <li>List of events participated in (with dates)</li>
                </ul>
              </ReportPreviewTable>
            </ReportCard>
            
            <ReportCard>
              <ReportTitle>
                <FaCalendarAlt />
                Event Details Report
              </ReportTitle>
              <ReportDescription>
                Shows information about events and the volunteers who participated in them, including event details and volunteer contact information.
              </ReportDescription>
              <ReportPreviewTable>
                <p><strong>Includes data:</strong></p>
                <ul>
                  <li>Event name and date</li>
                  <li>Event location and description</li>
                  <li>Event status</li>
                  <li>List of volunteers (with contact info)</li>
                </ul>
              </ReportPreviewTable>
            </ReportCard>
          </StyledGrid>
        </>
      )}
      
      {activeTab === 'notifications' && (
        <Card>
          <FormTitle>Send Notifications</FormTitle>
          <p style={{ marginBottom: theme.spacing.md, color: theme.colors.gray[600] }}>
            Use this form to send notifications to volunteers and organizers within the platform.
          </p>
          
          <FormGroup>
            <Label htmlFor="notification-title">Notification Title</Label>
            <Input 
              id="notification-title"
              type="text"
              value={notificationTitle}
              onChange={(e) => setNotificationTitle(e.target.value)}
              placeholder="Enter notification title"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="notification-message">Message</Label>
            <TextArea 
              id="notification-message"
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              placeholder="Enter notification message"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="notification-type">Notification Type</Label>
            <Select 
              id="notification-type"
              value={notificationType}
              onChange={(e) => setNotificationType(e.target.value)}
            >
              <option value="info">Information</option>
              <option value="success">Success</option>
              <option value="event">Event Update</option>
              <option value="message">Message</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="notification-recipients">Recipients</Label>
            <Select 
              id="notification-recipients"
              value={notificationRecipients}
              onChange={(e) => setNotificationRecipients(e.target.value)}
            >
              <option value="all">All Users</option>
              <option value="volunteers">All Volunteers</option>
              <option value="organizations">All Organizations</option>
              <option value="custom">Selected Users</option>
            </Select>
          </FormGroup>
          
          {notificationRecipients === 'custom' && (
            <FormGroup>
              <Label>Select Recipients</Label>
              <div style={{ maxHeight: '200px', overflowY: 'auto', border: `1px solid ${theme.colors.gray[300]}`, borderRadius: theme.borderRadius.md, padding: theme.spacing.sm }}>
                {users.map(user => (
                  <div key={user.id} style={{ padding: theme.spacing.xs, display: 'flex', alignItems: 'center' }}>
                    <input 
                      type="checkbox"
                      id={`user-${user.id}`}
                      checked={selectedUserIds.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUserIds([...selectedUserIds, user.id]);
                        } else {
                          setSelectedUserIds(selectedUserIds.filter(id => id !== user.id));
                        }
                      }}
                    />
                    <label htmlFor={`user-${user.id}`} style={{ marginLeft: theme.spacing.sm, cursor: 'pointer' }}>
                      {user.display_name} ({user.email}) - {user.type}
                    </label>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: theme.spacing.xs, fontSize: theme.fontSizes.sm, color: theme.colors.gray[600] }}>
                {selectedUserIds.length} users selected
              </div>
            </FormGroup>
          )}
          
          <StyledFlex $justify="flex-end" $gap={theme.spacing.md} style={{ marginTop: theme.spacing.lg }}>
            <SecondaryButton 
              onClick={() => {
                setNotificationTitle('');
                setNotificationMessage('');
                setNotificationType('info');
                setNotificationRecipients('all');
                setSelectedUserIds([]);
              }}
            >
              Clear Form
            </SecondaryButton>
            <PrimaryButton 
              onClick={async () => {
                if (!notificationTitle || !notificationMessage) {
                  alert('Please fill in all required fields');
                  return;
                }
                
                try {
                  setIsSendingNotification(true);
                  
                  let recipientIds: string[] = [];
                  
                  // Determine recipients based on selection
                  if (notificationRecipients === 'all') {
                    recipientIds = users.map(u => u.id);
                  } else if (notificationRecipients === 'volunteers') {
                    recipientIds = users.filter(u => u.type === 'volunteer').map(u => u.id);
                  } else if (notificationRecipients === 'organizations') {
                    recipientIds = users.filter(u => u.type === 'organization').map(u => u.id);
                  } else if (notificationRecipients === 'custom') {
                    recipientIds = selectedUserIds;
                  }
                  
                  if (recipientIds.length === 0) {
                    alert('No recipients selected');
                    setIsSendingNotification(false);
                    return;
                  }
                  
                  // Create notifications for each recipient
                  const notificationPromises = recipientIds.map(recipientId => {
                    return supabase
                      .from('notifications')
                      .insert({
                        recipient_id: recipientId,
                        type: notificationType,
                        title: notificationTitle,
                        message: notificationMessage,
                        is_read: false,
                        created_at: new Date().toISOString()
                      });
                  });
                  
                  await Promise.all(notificationPromises);
                  
                  alert(`Notifications sent successfully to ${recipientIds.length} users`);
                  
                  // Reset form
                  setNotificationTitle('');
                  setNotificationMessage('');
                  setNotificationType('info');
                  setNotificationRecipients('all');
                  setSelectedUserIds([]);
                  
                } catch (error) {
                  console.error('Error sending notifications:', error);
                  alert('Failed to send notifications. Please try again.');
                } finally {
                  setIsSendingNotification(false);
                }
              }}
              disabled={isSendingNotification}
            >
              {isSendingNotification ? 'Sending...' : 'Send Notifications'}
            </PrimaryButton>
          </StyledFlex>
        </Card>
      )}
      
      {/* Edit User Modal */}
      {isEditModalOpen && currentUser && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Edit User</ModalTitle>
              <CloseButton onClick={() => setIsEditModalOpen(false)}>×</CloseButton>
            </ModalHeader>
            
            <FormGroup>
              <Label>Email</Label>
              <Input value={userFormData.email} disabled />
              <p style={{ fontSize: '0.8rem', color: theme.colors.gray[600], marginTop: '4px' }}>
                Email cannot be changed
              </p>
            </FormGroup>
            
            <FormGroup>
              <Label>Display Name</Label>
              <Input 
                value={userFormData.display_name}
                onChange={(e) => setUserFormData({...userFormData, display_name: e.target.value})}
              />
            </FormGroup>
            
            <FormGroup>
              <Label>User Type</Label>
              <Select 
                value={userFormData.type}
                onChange={(e) => setUserFormData({...userFormData, type: e.target.value})}
              >
                <option value="volunteer">Volunteer</option>
                <option value="organization">Organization</option>
                <option value="admin">Admin</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label>Status</Label>
              <Select 
                value={userFormData.status}
                onChange={(e) => setUserFormData({...userFormData, status: e.target.value})}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </Select>
            </FormGroup>
            
            <StyledFlex $justify="flex-end" $gap="12px">
              <SecondaryButton onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </SecondaryButton>
              <PrimaryButton onClick={handleSaveUser}>
                <FaEdit style={{ marginRight: '8px' }} />
                Save Changes
              </PrimaryButton>
            </StyledFlex>
          </ModalContent>
        </ModalOverlay>
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && itemToDelete && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Confirm Deletion</ModalTitle>
              <CloseButton onClick={() => setIsDeleteModalOpen(false)}>×</CloseButton>
            </ModalHeader>
            
            <p>
              Are you sure you want to delete {itemToDelete.type === 'user' ? 'user' : 'event'}: 
              <strong> {itemToDelete.name}</strong>?
            </p>
            <p style={{ marginTop: '8px', color: theme.colors.error }}>
              This action cannot be undone.
            </p>
            
            <StyledFlex $justify="flex-end" $gap="12px" style={{ marginTop: '20px' }}>
              <SecondaryButton onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </SecondaryButton>
              <PrimaryButton 
                onClick={confirmDelete}
                style={{ backgroundColor: theme.colors.error }}
              >
                <FaTrash style={{ marginRight: '8px' }} />
                Delete Permanently
              </PrimaryButton>
            </StyledFlex>
          </ModalContent>
        </ModalOverlay>
      )}
    </AdminContainer>
  );
}
