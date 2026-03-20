import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode, faKey, faLink, faTerminal, faCopy, faCheckCircle, faExternalLinkAlt, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

export default function ApiDocs() {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState('PHP');

  const apiUrl = `${window.location.origin}/api/v2`;
  const apiKey = userData?.apiKey || 'YOUR_API_KEY';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const codeExamples: any = {
    PHP: `<?php
$post = [
    'key' => '${apiKey}',
    'action' => 'services', // services, add, status, balance
];

$ch = curl_init('${apiUrl}');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post));
$response = curl_exec($ch);
curl_close($ch);

print_r(json_decode($response, true));
?>`,
    JavaScript: `const axios = require('axios');

const data = new URLSearchParams({
  key: '${apiKey}',
  action: 'services'
});

axios.post('${apiUrl}', data)
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });`,
    Python: `import requests

url = "${apiUrl}"
payload = {
    "key": "${apiKey}",
    "action": "services"
}

response = requests.post(url, data=payload)
print(response.json())`,
    cURL: `curl -X POST ${apiUrl} \\
  -d "key=${apiKey}" \\
  -d "action=services"`
  };

  const endpoints = [
    {
      name: 'Fetch Services',
      action: 'services',
      params: [],
      response: `[
  {
    "service": 1,
    "name": "Instagram Followers",
    "category": "Instagram",
    "rate": "3.50",
    "min": "100",
    "max": "100000"
  }
]`
    },
    {
      name: 'Place Order',
      action: 'add',
      params: [
        { name: 'service', type: 'int', desc: 'Service ID' },
        { name: 'link', type: 'string', desc: 'Link to page' },
        { name: 'quantity', type: 'int', desc: 'Quantity to order' }
      ],
      response: `{
  "order": 123456
}`
    },
    {
      name: 'Order Status',
      action: 'status',
      params: [
        { name: 'order', type: 'int', desc: 'Order ID' }
      ],
      response: `{
  "charge": "3.50",
  "start_count": "1050",
  "status": "Completed",
  "remains": "0",
  "currency": "UGX"
}`
    },
    {
      name: 'Multiple Order Status',
      action: 'status',
      params: [
        { name: 'orders', type: 'string', desc: 'Order IDs separated by comma' }
      ],
      response: `{
  "123456": {
    "status": "Completed",
    "charge": "3.50",
    "start_count": "1050",
    "remains": "0"
  },
  "123457": {
    "status": "Processing",
    "charge": "2.00",
    "start_count": "500",
    "remains": "100"
  }
}`
    },
    {
      name: 'Check Balance',
      action: 'balance',
      params: [],
      response: `{
  "balance": "52.45",
  "currency": "UGX"
}`
    }
  ];

  return (
    <div className="pt-12 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-purple/10 text-brand-purple rounded-full border border-brand-purple/20">
          <FontAwesomeIcon icon={faCode} className="text-[10px]" />
          <span className="text-[10px] font-black uppercase tracking-widest">Developer API</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-black text-gray-900 tracking-tighter">
          API Documentation
        </h1>
        <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto font-medium">
          Integrate EasyBoost directly into your own website or SMM panel using our standard API.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Docs & Endpoints */}
        <div className="lg:col-span-7 space-y-12">
          {/* API Info Card */}
          <section className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-200 space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-purple text-xl shadow-sm border border-gray-100">
                <FontAwesomeIcon icon={faLink} />
              </div>
              <div>
                <h3 className="text-xl font-display font-black text-gray-900 tracking-tighter">API Endpoint</h3>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Base URL for all requests</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between group">
              <code className="text-xs font-mono font-bold text-brand-purple truncate mr-4">
                {apiUrl}
              </code>
              <button 
                onClick={() => copyToClipboard(apiUrl)}
                className="p-2 text-gray-400 hover:text-brand-purple transition-colors active-press"
              >
                <FontAwesomeIcon icon={faCopy} />
              </button>
            </div>

            <div className="flex items-center space-x-4 pt-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 text-xl shadow-sm border border-gray-100">
                <FontAwesomeIcon icon={faKey} />
              </div>
              <div>
                <h3 className="text-xl font-display font-black text-gray-900 tracking-tighter">Authentication</h3>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Your Private API Key</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between group">
              <code className="text-xs font-mono font-bold text-gray-900 truncate mr-4">
                {apiKey}
              </code>
              <button 
                onClick={() => copyToClipboard(apiKey)}
                className="p-2 text-gray-400 hover:text-brand-purple transition-colors active-press"
              >
                <FontAwesomeIcon icon={faCopy} />
              </button>
            </div>
          </section>

          {/* Endpoints Section */}
          <div className="space-y-8">
            <h3 className="text-2xl font-display font-black text-gray-900 tracking-tighter flex items-center space-x-3">
              <FontAwesomeIcon icon={faTerminal} className="text-brand-purple text-lg" />
              <span>Available Actions</span>
            </h3>

            {endpoints.map((endpoint, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-display font-black text-gray-900 tracking-tighter">{endpoint.name}</h4>
                  <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[8px] font-black uppercase tracking-widest rounded-full">
                    action: {endpoint.action}
                  </span>
                </div>

                {endpoint.params.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Parameters</p>
                    <div className="grid grid-cols-1 gap-2">
                      {endpoint.params.map((param, pIdx) => (
                        <div key={pIdx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex items-center space-x-3">
                            <span className="text-xs font-bold text-gray-900">{param.name}</span>
                            <span className="text-[8px] font-black text-brand-purple uppercase">{param.type}</span>
                          </div>
                          <span className="text-[10px] text-gray-500 font-medium">{param.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Example Response</p>
                  <pre className="bg-gray-900 p-5 rounded-2xl text-emerald-400 text-xs font-mono overflow-x-auto">
                    {endpoint.response}
                  </pre>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column: Code Examples */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-8">
            <div className="bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="flex bg-white/5 p-1 rounded-xl">
                  {Object.keys(codeExamples).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setActiveTab(lang)}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeTab === lang ? 'bg-white text-gray-900 shadow-sm' : 'text-white/40 hover:text-white'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <pre className="p-8 text-xs font-mono text-white/80 overflow-x-auto leading-relaxed max-h-[600px]">
                  {codeExamples[activeTab]}
                </pre>
                <button 
                  onClick={() => copyToClipboard(codeExamples[activeTab])}
                  className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-xl flex items-center justify-center transition-all active-press"
                >
                  <FontAwesomeIcon icon={faCopy} />
                </button>
              </div>
            </div>

            {/* Security Note */}
            <div className="bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-[2.5rem] space-y-4">
              <div className="flex items-center space-x-3 text-emerald-600">
                <FontAwesomeIcon icon={faShieldAlt} />
                <h4 className="font-display font-black tracking-tighter uppercase text-sm">Security Best Practices</h4>
              </div>
              <ul className="space-y-3">
                {[
                  'Never share your API key publicly',
                  'Use server-side requests to hide your key',
                  'Regenerate your key if it is compromised',
                  'Rate limit your own requests to avoid blocks'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-3 text-[10px] text-emerald-700/70 font-bold">
                    <FontAwesomeIcon icon={faCheckCircle} className="mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
