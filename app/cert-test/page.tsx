'use client';

import { CertificateTemplate } from '@/components/CertificateTemplate';
import { useRef, useState, useEffect } from 'react';

export default function CertTestPage() {
  const ref = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("G'ANIYEV ALISHER VALIYEVICH");
  const [course, setCourse] = useState("Shar dekoratsiyasi");

  const courses = [
    'Shar dekoratsiyasi', 'Smm darslari', 'Time managment',
    'Notiqlik Darslari', 'Volontyorlik', 'Imij', 'Moliyaviy savodxonlik'
  ];

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Sertifikat Preview</h1>
      
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input 
          value={name} 
          onChange={e => setName(e.target.value)}
          placeholder="Ism-familiya"
          style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', width: '300px' }}
        />
        <select 
          value={course} 
          onChange={e => setCourse(e.target.value)}
          style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px' }}
        >
          {courses.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ border: '2px solid #ccc', display: 'inline-block', borderRadius: '8px', overflow: 'hidden' }}>
        <CertificateTemplate
          ref={ref}
          id="GRW-TEST-1234"
          studentName={name}
          courseName={course}
          date="2026-04-27"
        />
      </div>
    </div>
  );
}
