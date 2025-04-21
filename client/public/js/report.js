/*document.addEventListener('DOMContentLoaded', function() {
    // Initialize date pickers
    flatpickr(".datepicker", {
        dateFormat: "Y-m-d",
        allowInput: true
    });

    // Form submission handler
    document.getElementById('reportFilters').addEventListener('submit', function(e) {
        e.preventDefault();
        generateReport();
    });
    
    // Reset filters handler
    document.getElementById('resetFilters').addEventListener('click', function() {
        document.getElementById('startDate').value = '';
        document.getElementById('endDate').value = '';
        document.getElementById('status').value = '';
        document.getElementById('urgency').value = '';
        document.getElementById('skill').value = '';
        generateReport();
    });
    
    // Export to CSV handler
    document.getElementById('exportCsv').addEventListener('click', exportToCsv);
    
    // Refresh data handler
    document.getElementById('refreshData').addEventListener('click', generateReport);
    
    // Initial report load
    generateReport();
    */
  
    async function generateReport() {
        // Show loading spinner
        document.querySelector('.loading-spinner').style.display = 'block';
        document.querySelector('.no-results').style.display = 'none';
        document.querySelector('.table-container').style.display = 'none';
        
        // Get filter values
        const filters = {
            startDate: document.getElementById('startDate').value,
            endDate: document.getElementById('endDate').value,
            status: document.getElementById('status').value,
            urgency: document.getElementById('urgency').value,
            skill: document.getElementById('skill').value
        };
        
        try {
         
            const queryParams = new URLSearchParams();
            for (const key in filters) {
                if (filters[key]) {
                    queryParams.append(key, filters[key]);
                }
            }
            
         
            const backendUrl = 'http://localhost:3002'; 
            const apiUrl = `${backendUrl}/api/report?${queryParams.toString()}`;
            console.log('Making request to:', apiUrl); 
            
        
            const response = await fetch(apiUrl, {
                headers: {
                    'Content-Type': 'application/json',
                   
                }
            });
            
            if (!response.ok) {
              
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Request failed with status ${response.status}`);
            }
            
            const result = await response.json();
            
         
            displayResults(result.data);
        } catch (error) {
            console.error('Error generating report:', error);
            showError(error.message || 'Failed to generate report. Please try again.');
        } finally {
            document.querySelector('.loading-spinner').style.display = 'none';
        }
    }
    
    function displayResults(events) {
        const tableBody = document.getElementById('reportData');
        tableBody.innerHTML = '';
        
        if (!events || events.length === 0) {
            document.querySelector('.no-results').style.display = 'block';
            document.querySelector('.table-container').style.display = 'none';
            document.getElementById('resultCount').textContent = '0 events';
            return;
        }
        
        document.querySelector('.no-results').style.display = 'none';
        document.querySelector('.table-container').style.display = 'block';
        document.getElementById('resultCount').textContent = `${events.length} ${events.length === 1 ? 'event' : 'events'}`;
        
        events.forEach(event => {
            const row = document.createElement('tr');
            
            // Format dates
            const startDate = formatDate(event.start_date);
            const endDate = formatDate(event.end_date);
            
            // Format status badge
            let statusClass = '';
            switch(event.status) {
                case 'Planned': statusClass = 'status-planned'; break;
                case 'InProgress': statusClass = 'status-inprogress'; break;
                case 'Completed': statusClass = 'status-completed'; break;
                case 'Cancelled': statusClass = 'status-cancelled'; break;
            }
            
            // Format urgency
            let urgencyClass = '';
            switch(event.urgency) {
                case 'High': urgencyClass = 'urgency-high'; break;
                case 'Medium': urgencyClass = 'urgency-medium'; break;
                case 'Low': urgencyClass = 'urgency-low'; break;
            }
            
         
            const skills = Array.isArray(event.required_skills) ? 
                event.required_skills.join(', ') : 
                (event.required_skills || 'None specified');
            
           
            let progressBar = '';
            if (event.max_volunteers) {
                const percentage = Math.min(
                    Math.round((event.current_volunteers / event.max_volunteers) * 100),
                    100
                );
                progressBar = `
                    <div class="progress">
                        <div class="progress-bar" 
                             role="progressbar" 
                             style="width: ${percentage}%" 
                             aria-valuenow="${percentage}" 
                             aria-valuemin="0" 
                             aria-valuemax="100">
                            ${percentage}%
                        </div>
                    </div>
                    <small class="text-muted">${event.current_volunteers}/${event.max_volunteers}</small>
                `;
            } else {
                progressBar = '<span class="text-muted">No limit</span>';
            }
            
            row.innerHTML = `
                <td><strong>${event.event_name}</strong></td>
                <td>${event.description || ''}</td>
                <td>${event.location || ''}</td>
                <td>${startDate}</td>
                <td>${endDate}</td>
                <td>${event.duration_hours} hours</td>
                <td><span class="status-badge ${statusClass}">${event.status}</span></td>
                <td class="${urgencyClass}">${event.urgency}</td>
                <td>${progressBar}</td>
                <td>${skills}</td>
            `;
            
            tableBody.appendChild(row);
        });
    }
    
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    function showError(message) {
        const noResults = document.querySelector('.no-results');
        noResults.querySelector('h4').textContent = 'Error Loading Report';
        noResults.querySelector('p').textContent = message;
        noResults.style.display = 'block';
        document.querySelector('.table-container').style.display = 'none';
    }
    
    function exportToCsv() {
        const rows = document.querySelectorAll('#reportData tr');
        if (rows.length === 0) {
            alert('No data to export');
            return;
        }
        
        let csvContent = "data:text/csv;charset=utf-8,";
        
        // Add headers
        const headers = [];
        document.querySelectorAll('#reportTable thead th').forEach(header => {
            headers.push(header.textContent);
        });
        csvContent += headers.join(",") + "\r\n";
        
        // Add data rows
        rows.forEach(row => {
            const rowData = [];
            row.querySelectorAll('td').forEach(cell => {
            
                let text = cell.textContent.trim();
            
                text = text.replace(/\s+/g, ' ');
           
                text = text.replace(/"/g, '""');
        
                if (text.includes(',')) {
                    text = `"${text}"`;
                }
                rowData.push(text);
            });
            csvContent += rowData.join(",") + "\r\n";
        });
        
   
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `event_report_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    

document.addEventListener('DOMContentLoaded', function() {

    flatpickr(".datepicker", {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        time_24hr: true,
        minuteIncrement: 15
    });


    generateReport();
});


document.getElementById('reportFilters').addEventListener('submit', function(e) {
    e.preventDefault();
    generateReport();
});

document.getElementById('exportCsv').addEventListener('click', exportToCsv);
document.getElementById('refreshData').addEventListener('click', generateReport);
document.getElementById('resetFilters').addEventListener('click', function() {
document.getElementById('reportFilters').reset(); generateReport();
});