const fs = require('fs');
const path = 'd:\\Zakazlar\\Website\\grow\\grows\\app\\admin\\page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Use a regex to find the problematic section and fix it
// Looking for the Qisqacha Tavsif textarea followed by the messed up closing div and opening div
const pattern = /<textarea rows=\{2\} value=\{lessonForm\.description\}[\s\S]*?<\/div>[\s\S]*?<div>[\s\S]*?Video Havolasi/;
const replacement = `<textarea rows={2} value={lessonForm.description} onChange={e => setLessonForm({...lessonForm, description: e.target.value})} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A8E6CF]" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Video Havolasi`;

if (pattern.test(content)) {
    content = content.replace(pattern, replacement);
    fs.writeFileSync(path, content);
    console.log('Successfully fixed the file!');
} else {
    console.log('Pattern not found. Checking content...');
    // Log a slice of content to debug
    const startIdx = content.indexOf('Qisqacha Tavsif');
    console.log(content.slice(startIdx, startIdx + 300));
}
