// Chart Renderer Component using Chart.js
export const chartRenderer = {
  charts: new Map(),
  
  renderActivityChart(canvasId, activityData) {
    if (!window.Chart) {
      console.warn('Chart.js nicht geladen');
      return;
    }
    
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    // Destroy existing chart if present
    if (this.charts.has(canvasId)) {
      this.charts.get(canvasId).destroy();
    }
    
    // Prepare data for last 30 days
    const days = 30;
    const labels = [];
    const postsData = [];
    const messagesData = [];
    const forumData = [];
    
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      labels.push(date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }));
      
      // Count activities for this date
      const dayActivities = activityData.filter(a => {
        const actDate = new Date(a.createdAt).toISOString().split('T')[0];
        return actDate === dateStr;
      });
      
      postsData.push(dayActivities.filter(a => a.type === 'post_written' || a.type === 'thread_created').length);
      messagesData.push(dayActivities.filter(a => a.type === 'message_sent').length);
      forumData.push(dayActivities.filter(a => a.type === 'forum_reply' || a.type === 'thread_created').length);
    }
    
    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Forum Beiträge',
            data: forumData,
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Nachrichten',
            data: messagesData,
            borderColor: 'rgb(6, 182, 212)',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Posts',
            data: postsData,
            borderColor: 'rgb(139, 92, 246)',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
    
    this.charts.set(canvasId, chart);
    return chart;
  },
  
  destroyChart(canvasId) {
    if (this.charts.has(canvasId)) {
      this.charts.get(canvasId).destroy();
      this.charts.delete(canvasId);
    }
  },
  
  destroyAll() {
    this.charts.forEach((chart, id) => {
      chart.destroy();
    });
    this.charts.clear();
  }
};





















