import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { TopicMastery } from '../types';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface RadarChartProps {
  topicMasteries: TopicMastery[];
}

export const RadarChart: React.FC<RadarChartProps> = ({ topicMasteries }) => {
  // If no topics evaluated, show placeholder
  if (!topicMasteries || topicMasteries.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        No topic mastery data to render radar chart.
      </div>
    );
  }

  // Use main topics or subtopics if single topic
  const labels = topicMasteries.map((tm) => tm.topic);
  const studentScores = topicMasteries.map((tm) => tm.accuracy);
  // Benchmark baseline 70% threshold
  const baselineScores = topicMasteries.map(() => 70);

  const data = {
    labels,
    datasets: [
      {
        label: 'Your Conceptual Mastery (%)',
        data: studentScores,
        backgroundColor: 'rgba(59, 130, 246, 0.25)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2.5,
        pointBackgroundColor: studentScores.map((s) => (s < 60 ? '#ef4444' : s >= 80 ? '#10b981' : '#3b82f6')),
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
        pointRadius: 5,
        pointHoverRadius: 7
      },
      {
        label: 'Target Proficiency Threshold (70%)',
        data: baselineScores,
        backgroundColor: 'rgba(148, 163, 184, 0.08)',
        borderColor: 'rgba(148, 163, 184, 0.5)',
        borderWidth: 1.5,
        borderDash: [4, 4],
        pointRadius: 0
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          color: 'rgba(203, 213, 225, 0.5)'
        },
        grid: {
          color: 'rgba(203, 213, 225, 0.4)'
        },
        pointLabels: {
          font: {
            size: 12,
            weight: 600 as const,
            family: "'Inter', sans-serif"
          },
          color: '#1e293b'
        },
        ticks: {
          backdropColor: 'transparent',
          color: '#64748b',
          stepSize: 20,
          beginAtZero: true,
          min: 0,
          max: 100
        },
        suggestedMin: 0,
        suggestedMax: 100
      }
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 14,
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          },
          color: '#475569'
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const val = context.raw;
            if (context.datasetIndex === 0) {
              const status = val >= 80 ? 'Mastered 🟢' : val >= 60 ? 'Developing 🟡' : 'Weak / Gap 🔴';
              return ` Mastery: ${val}% (${status})`;
            }
            return ` Baseline: ${val}%`;
          }
        }
      }
    }
  };

  return (
    <div className="w-full h-80 relative flex items-center justify-center">
      <Radar data={data} options={options} />
    </div>
  );
};
