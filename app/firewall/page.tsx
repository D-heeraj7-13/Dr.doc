"use client";

import React, { useState } from "react";
import { generateDoc } from "../../src/templates/renderDocument";
import { downloadFile } from "../../src/utils/downloadDoc";
import DynamicForm from "../../src/components/DynamicForm";

export default function FirewallPage() {
  const [meta, setMeta] = useState<any>({
    title: "Fortinet Firewall Deployment – Mahape (Navi Mumbai)",
    customer: "L&T Finance Ltd.",
    date: "27-03-2025",
    createdBy: "Atharva Sathe",
    logo: null,
    hasBorder: true,
  });

  const [sections, setSections] = useState<any[]>([
    {
      id: "toc",
      type: "text",
      title: "Table of Contents",
      content: `1. Perimeter Firewall Design\n2. Scope of Work\n3. Handover\n4. Project Closure`,
      layout: { x: 0, y: 0, w: 12, h: 6 }
    },
    {
      id: "scope",
      type: "table",
      title: "Configuration & Migration Scope of Work (Firewall)",
      columns: ["Sr No.", "Description", "SOW", "Comments"],
      rows: [
        { "Sr No.": "1", Description: "Background", SOW: "Perimeter Firewall\nMahape (New Mumbai)", Comments: "" },
        { "Sr No.": "2", Description: "Installation and Hardware Setup : (POST)", SOW: "Rack, stack & mounting of FortiGate 400F appliance and connecting power, network cables to perform POST.", Comments: "" },
        { "Sr No.": "3", Description: "Initial Configuration", SOW: "Access the FortiGate web-based manager or command line interface (CLI).\nPerform basic initial configurations, including setting the system hostname, time zone, and administrator credentials.", Comments: "" },
        { "Sr No.": "4", Description: "OS Upgradation", SOW: "Upgrading to latest OS recommended by OEM", Comments: "" },
        { "Sr No.": "5", Description: "Migration configuration", SOW: "Migrating existing Sonicwall/Fortigate to Fortigate 400F\nMigration will be as-is from existing configuration.", Comments: "" },
        { "Sr No.": "6", Description: "Basic Routing", SOW: "Import or creating the routes for basic connectivity between networks", Comments: "" },
        { "Sr No.": "7", Description: "Security Policies", SOW: "Define and implement security policies based on organizational requirements upto 10 new policies of firewall rules, routing rules & NAT policies.\nFor more policies, please indicate.", Comments: "" },
        { "Sr No.": "8", Description: "Object Creations", SOW: "Objects and group creation\nWe have assumed 30 new objects.", Comments: "" },
        { "Sr No.": "9", Description: "HA Configuration", SOW: "Active-Passive\nAlready configured", Comments: "" },
        { "Sr No.": "10", Description: "Testing and Verification", SOW: "Conduct testing of the firewall configurations.\nVerify the functionality of firewall rules, VPN connections.\n• The Airtel ILL was assigned a port number of 2...\n• Both firewalls have been backed up...\n• You checked and were able to connect to the firewall via the WAN IP.", Comments: "" },
        { "Sr No.": "11", Description: "GO-Live support", SOW: "Support during Live Deployment and monitoring (2Days)\nFirewall is live which Sanjay has confirmed.", Comments: "" },
        { "Sr No.": "12", Description: "Knowledge Transfer", SOW: "Knowledge Transfer Session will be provided", Comments: "" },
        { "Sr No.": "13", Description: "Project Closure", SOW: "Project Closure document will be provided", Comments: "" },
      ],
      layout: { x: 0, y: 10, w: 12, h: 28 }
    },
    {
      id: "handover",
      type: "text",
      title: "Handover",
      content: "The Techsec Digital team will provide the Knowledge transfer session on the configuration of policies and provide the reports.",
      layout: { x: 0, y: 40, w: 12, h: 4 }
    },
    {
      id: "closure",
      type: "text",
      title: "Project Closure",
      content: "After successful completion of Wireless Access Point Implementation, User acceptance test & handover of project technical documentation, both Techsec Digital and L&T Finance Ltd. will sign the project completion milestone report.\n\nProject Sign off\n\nBy signing this document, the client acknowledges that the work detailed above has been completed as per the agreed Scope of Work (SOW) and is deemed satisfactory.\n\nBy signing below, you agree to the terms and conditions listed in the scope of work above. No changes or additions to the scope of work will be accepted after the date that appears below. Additional work MUST be scheduled as a separate service by executing a Change Order, which may be chargeable.",
      layout: { x: 0, y: 45, w: 12, h: 12 }
    },
    {
      id: "signoff",
      type: "signature",
      title: "Project Sign off",
      fields: [
        { label: "Name", value: "" },
        { label: "Role", value: "" },
        { label: "Signature", value: "" },
        { label: "Date", value: "" },
      ],
      layout: { x: 0, y: 60, w: 12, h: 8 }
    },
  ]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setMeta({ ...meta, logo: event.target?.result as ArrayBuffer });
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleDownload = async () => {
    try {
      const blob = await generateDoc({ meta, sections });
      downloadFile(blob, `Fortinet_Firewall_${meta.customer || "Mahape"}.docx`);
    } catch (err) {
      console.error("Failed to generate document:", err);
      alert("Error generating document. Check console for details.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-12 pb-20">
      <header className="flex justify-between items-end border-b pb-6">
        <div>
          <h1 className="text-4xl font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter">
            Firewall Deployment
          </h1>
          <p className="text-zinc-500 font-medium italic">Automated Professional Document Generator</p>
        </div>
        <button
          onClick={handleDownload}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
        >
          Generate Word (.docx)
        </button>
      </header>

      {/* Meta Settings - same as before but with better labels */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-8 p-6 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-inner">
        {/* Logo, Customer, Title, Date, Border - same as your original */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Company Logo</label>
          <input type="file" accept="image/*" onChange={handleLogoUpload} className="..." />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Customer Name</label>
          <input className="..." value={meta.customer} onChange={(e) => setMeta({ ...meta, customer: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Document Title</label>
          <input className="..." value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Effective Date</label>
          <input type="date" className="..." value={meta.date} onChange={(e) => setMeta({ ...meta, date: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Page Border</label>
          <div className="flex ...">
            <button onClick={() => setMeta({ ...meta, hasBorder: true })} className={`... ${meta.hasBorder ? "bg-blue-600 text-white" : ""}`}>ON</button>
            <button onClick={() => setMeta({ ...meta, hasBorder: false })} className={`... ${!meta.hasBorder ? "bg-zinc-400 text-white" : ""}`}>OFF</button>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        {sections.map((section, index) => (
          <DynamicForm
            key={section.id || index}
            section={section}
            index={index}
            updateSection={(idx, updated) => {
              const next = [...sections];
              next[idx] = updated;
              setSections(next);
            }}
            removeSection={(idx) => setSections(sections.filter((_, i) => i !== idx))}
            handleImageUpload={() => {}}
          />
        ))}
      </div>
    </div>
  );
}