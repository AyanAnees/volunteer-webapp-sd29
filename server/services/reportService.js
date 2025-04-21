const supabase = require('../config/supabase');

const reportService = {
    /**
     * Get comprehensive event report with advanced filtering and analytics
     * @param {object} filters - Report filters
     * @returns {Promise<{data: array|null, error: string|null}>} 
     */
    async getEventReport(filters = {}) {
        try {
            // Base query
            let query = supabase
                .from('events')
                .select(`
                    id,
                    event_name,
                    description,
                    location,
                    required_skills,
                    urgency,
                    start_date,
                    end_date,
                    max_volunteers,
                    current_volunteers,
                    status,
                    created_at,
                    created_by
                `);
            
            // Apply filters
            if (filters.status) {
                query = query.eq('status', filters.status);
            }
            
            if (filters.urgency) {
                query = query.eq('urgency', filters.urgency);
            }
            
            if (filters.skill) {
                query = query.contains('required_skills', [filters.skill]);
            }
            
            if (filters.startDate) {
                query = query.gte('start_date', filters.startDate);
            }
            
            if (filters.endDate) {
                query = query.lte('end_date', filters.endDate);
            }
            
            // Order by start date
            query = query.order('start_date', { ascending: true });
            
            const { data, error } = await query;
            
            if (error) throw error;
            
            // Transform data for reporting
            const reportData = data.map(event => ({
                ...event,
                duration_hours: this.calculateDurationHours(event.start_date, event.end_date),
                volunteer_capacity: event.max_volunteers 
                    ? (event.current_volunteers / event.max_volunteers * 100).toFixed(0)
                    : null
            }));
            
            return { data: reportData, error: null };
            
        } catch (error) {
            console.error('Report service error:', error.message);
            return { data: null, error: error.message };
        }
    },
    
    /**
     * Calculate duration between two dates in hours
     * @param {string} start - ISO date string
     * @param {string} end - ISO date string
     * @returns {number} Duration in hours
     */
    calculateDurationHours(start, end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        return ((endDate - startDate) / (1000 * 60 * 60)).toFixed(1);
    },
    
    /**
     * Get event statistics for dashboard
     */
    async getEventStatistics() {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('status, urgency, start_date');
            
            if (error) throw error;
            
            const now = new Date();
            const stats = {
                total: data.length,
                byStatus: {
                    Planned: 0,
                    InProgress: 0,
                    Completed: 0,
                    Cancelled: 0
                },
                byUrgency: {
                    High: 0,
                    Medium: 0,
                    Low: 0
                },
                upcoming: 0,
                past: 0
            };
            
            data.forEach(event => {
           
                stats.byStatus[event.status]++;
              
                stats.byUrgency[event.urgency]++;
                
               
                const eventDate = new Date(event.start_date);
                if (eventDate > now) {
                    stats.upcoming++;
                } else {
                    stats.past++;
                }
            });
            
            return { data: stats, error: null };
            
        } catch (error) {
            console.error('Statistics service error:', error.message);
            return { data: null, error: error.message };
        }
    }
};

module.exports = reportService;