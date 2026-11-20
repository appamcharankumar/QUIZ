import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { TopicMastery } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface CohortBenchmarkChartProps {
  topicMasteries: TopicMastery[];
}

export const CohortBenchmarkChart: React.FC<CohortBenchmarkChartProps> = ({ topicMasteries }) => {
  if (!topicMasteries || topicMasteries.length === 0) {
    return null;
  }

  // Simulated cohort benchmarks per topic
  const defaultCohortAverages: Record<string, number> = {
    'Data Structures': 64.5,
    'Algorithms': 58.2,
    'Operating Systems': 61.8,
    'Computer Networks': 66.0
  };

  const labels = topicMasteries.map((tm) => tm.topic);
  const studentScores = topicMasteries.map((tm) => tm.accuracy);
  const cohortScores = topicMasteries.map((tm) => defaultCohortAverages[tm.topic] || 62.0);

  const data = {
    labels,
    datasets: [
      {
        label: 'Your Accuracy (%)',
        data: studentScores,
        backgroundColor: 'rgba(59, 130, 246, 0.85)',
        borderColor: '#2563eb',
        borderWidth: 1,
        borderRadius: 6
      },
      {
        label: 'Simulated Cohort Batch Average (%)',
        data: cohortScores,
        backgroundColor: 'rgba(148, 163, 184, 0.6)',
        borderColor: '#94a3b8',
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          color: '#64748b'
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.8)'
        }
      },
      x: {
        ticks: {
          color: '#334155',
          font: { weight: 600 as const, size: 11 }
        },
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          font: { size: 11 },
          color: '#475569'
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => ` ${context.dataset.label}: ${context.raw}%`
        }
      }
    }
  };

  return (
    <div className="w-full h-72">
      <Bar data={data} options={options} />
    </div>
  );
};
