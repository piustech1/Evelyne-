import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTicketAlt, faEye, faReply, faCheckCircle, faClock } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';

const tickets = [
  { id: '#TKT-1021', user: 'john_doe', subject: 'Payment not reflecting', status: 'Open', date: '2026-03-02 05:40' },
  { id: '#TKT-1020', user: 'sarah_smith', subject: 'Order refill request', status: 'Answered', date: '2026-03-02 05:25' },
  { id: '#TKT-1019', user: 'mike_ross', subject: 'Service inquiry', status: 'Closed', date: '2026-03-02 04:40' },
];

export default function AdminTickets() {
  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-black text-brand-dark tracking-tighter mb-2">Tickets</h1>
          <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Support your customers and resolve their issues</p>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
                <th className="pb-6 px-4">Ticket ID</th>
                <th className="pb-6 px-4">User</th>
                <th className="pb-6 px-4">Subject</th>
                <th className="pb-6 px-4">Status</th>
                <th className="pb-6 px-4">Date</th>
                <th className="pb-6 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tickets.map((ticket, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group hover:bg-brand-light/30 transition-colors"
                >
                  <td className="py-6 px-4 text-sm font-black text-brand-dark">{ticket.id}</td>
                  <td className="py-6 px-4 text-sm font-bold text-gray-500">{ticket.user}</td>
                  <td className="py-6 px-4 text-sm font-bold text-gray-700">{ticket.subject}</td>
                  <td className="py-6 px-4">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      ticket.status === 'Open' ? 'bg-rose-100 text-rose-600' :
                      ticket.status === 'Answered' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="py-6 px-4 text-xs font-bold text-gray-400">{ticket.date}</td>
                  <td className="py-6 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="w-9 h-9 rounded-xl bg-gray-50 text-gray-400 hover:text-brand-orange hover:bg-brand-orange/10 transition-all flex items-center justify-center">
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button className="w-9 h-9 rounded-xl bg-gray-50 text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center">
                        <FontAwesomeIcon icon={faReply} />
                      </button>
                      <button className="w-9 h-9 rounded-xl bg-gray-50 text-emerald-500 hover:bg-emerald-50 transition-all flex items-center justify-center">
                        <FontAwesomeIcon icon={faCheckCircle} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
