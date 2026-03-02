import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faChartLine, faChartPie, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';

export default function AdminReports() {
  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-black text-brand-dark tracking-tighter mb-2">Reports</h1>
          <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">In-depth analytics and performance metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-display font-black text-brand-dark tracking-tighter">Revenue Analysis</h3>
            <div className="flex items-center space-x-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
              <FontAwesomeIcon icon={faArrowUp} />
              <span>+15% this month</span>
            </div>
          </div>
          <div className="h-64 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-300 font-black uppercase tracking-[0.2em] text-xs">
            Revenue Chart Placeholder
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-display font-black text-brand-dark tracking-tighter">Order Volume</h3>
            <div className="flex items-center space-x-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
              <FontAwesomeIcon icon={faArrowUp} />
              <span>+8% this month</span>
            </div>
          </div>
          <div className="h-64 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-300 font-black uppercase tracking-[0.2em] text-xs">
            Orders Chart Placeholder
          </div>
        </div>
      </div>
    </div>
  );
}
