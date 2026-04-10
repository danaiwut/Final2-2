import React from "react"
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from "lucide-react"

// Ensure we handle both Persona data directly or Resume data format
export function mapResumeData(resume: any) {
  return {
    fullName: resume.full_name || "Your Name",
    title: resume.title || "Professional Title",
    email: resume.email || "email@example.com",
    phone: resume.phone || "+1 234 567 8900",
    location: resume.location || "City, Country",
    website: resume.website || "",
    linkedin: resume.linkedin || "",
    github: resume.github || "",
    summary: resume.summary || "Professional summary goes here...",
    experience: Array.isArray(resume.experience) && resume.experience.length > 0 ? resume.experience : [],
    education: Array.isArray(resume.education) && resume.education.length > 0 ? resume.education : [],
    skills: Array.isArray(resume.skills) && resume.skills.length > 0 ? resume.skills : ["Skill 1", "Skill 2"],
    projects: Array.isArray(resume.projects) && resume.projects.length > 0 ? resume.projects : [],
    certifications: Array.isArray(resume.certifications) ? resume.certifications : [],
    color: resume.color_scheme || "#3B2A1A", 
  }
}

// ---------------------------------------------------------------------------
// Template 1 (Modern Dark Side - based on Image 1)
// Left column dark colored, Right column white
// ---------------------------------------------------------------------------
export function TemplateOne({ resume }: { resume: any }) {
  const data = mapResumeData(resume)
  
  return (
    <div className="flex w-full h-full bg-white text-gray-800 overflow-hidden text-sm" style={{ minHeight: '100%' }}>
      {/* Left Column */}
      <div className="w-1/3 text-white p-6" style={{ backgroundColor: data.color }}>
        <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-white/20 mx-auto bg-white/20">
            {/* Placeholder for Photo */}
        </div>
        
        <div className="mb-8">
          <h3 className="text-lg font-bold border-b border-white/30 pb-2 mb-3">Contact</h3>
          <div className="space-y-3 text-xs">
            {data.phone && <div><span className="font-semibold block">Phone</span>{data.phone}</div>}
            {data.email && <div><span className="font-semibold block">Email</span>{data.email}</div>}
            {data.location && <div><span className="font-semibold block">Address</span>{data.location}</div>}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-bold border-b border-white/30 pb-2 mb-3">Education</h3>
          <div className="space-y-4 text-xs">
            {data.education.length > 0 ? data.education.map((edu: any, i: number) => (
              <div key={i}>
                <div className="font-semibold">{edu.institution || edu.school}</div>
                <div>{edu.degree || edu.degreeName} {edu.field ? `in ${edu.field}` : ''}</div>
                <div className="text-white/70">{edu.graduation_year || edu.year || edu.duration}</div>
              </div>
            )) : (
              <div>
                <div className="font-semibold">University Name</div>
                <div>Degree Name</div>
                <div className="text-white/70">YYYY - YYYY</div>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold border-b border-white/30 pb-2 mb-3">Expertise</h3>
          <ul className="list-disc pl-4 space-y-1 text-xs">
            {data.skills.map((skill: any, i: number) => (
              <li key={i}>{typeof skill === 'string' ? skill : skill.name || skill}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Column */}
      <div className="w-2/3 p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-1" style={{ color: data.color }}>{data.fullName}</h1>
        <h2 className="text-xl text-gray-500 tracking-widest uppercase mb-6">{data.title}</h2>
        <p className="text-xs text-gray-600 mb-8 leading-relaxed">
          {data.summary}
        </p>

        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-4" style={{ color: data.color }}>Experience</h3>
          <div className="space-y-6">
            {data.experience.length > 0 ? data.experience.map((exp: any, i: number) => (
              <div key={i} className="relative pl-6 border-l-2" style={{ borderColor: data.color }}>
                <div className="absolute w-3 h-3 rounded-full -left-[7px] top-1" style={{ backgroundColor: data.color }} />
                <div className="text-xs font-semibold text-gray-500 mb-1">{exp.duration || "YYYY - YYYY"}</div>
                <div className="font-bold text-gray-800">{exp.company || "Company Name"}</div>
                <div className="font-semibold text-gray-600 mb-2">{exp.title || "Job Title"}</div>
                <p className="text-xs text-gray-600">{exp.description || "Job description..."}</p>
              </div>
            )) : (
              <div className="relative pl-6 border-l-2" style={{ borderColor: data.color }}>
                <div className="absolute w-3 h-3 rounded-full -left-[7px] top-1" style={{ backgroundColor: data.color }} />
                <div className="text-xs font-semibold text-gray-500 mb-1">2020 - Present</div>
                <div className="font-bold text-gray-800">Company Name</div>
                <div className="font-semibold text-gray-600 mb-2">Job Title</div>
                <p className="text-xs text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Template 2 (Blue Header Minimal - based on Image 2)
// Header has name. Left column is mostly white, right is lightly filled with color.
// ---------------------------------------------------------------------------
export function TemplateTwo({ resume }: { resume: any }) {
  const data = mapResumeData(resume)
  const bgColor = `${data.color}20` // 20% opacity for background

  return (
    <div className="flex flex-col w-full h-full bg-white text-gray-800 overflow-hidden text-sm">
      {/* Top Header */}
      <div className="flex">
        <div className="w-2/3 p-8 pt-10">
          <h1 className="text-5xl font-bold uppercase tracking-tight" style={{ color: data.color }}>
            {data.fullName}
          </h1>
        </div>
        <div className="w-1/3" style={{ backgroundColor: bgColor }}>
            {/* Photo placeholder */}
        </div>
      </div>
      
      {/* Summary Strip */}
      <div className="px-8 py-6 text-white" style={{ backgroundColor: data.color }}>
        <h3 className="font-bold uppercase mb-2 border-b border-white/30 pb-1 inline-block">Summary</h3>
        <p className="text-xs opacity-90 leading-relaxed">{data.summary}</p>
      </div>

      <div className="flex flex-1">
        {/* Left Col (Experience/Education) */}
        <div className="w-2/3 p-8">
          <h3 className="font-bold text-lg uppercase mb-4 pb-1 border-b-2 inline-block text-gray-500" style={{ borderBottomColor: bgColor }}>Experience</h3>
          <div className="space-y-5 mb-8">
            {data.experience.length > 0 ? data.experience.map((exp: any, i: number) => (
              <div key={i}>
                <div className="font-bold">{exp.company || "Company"} - {exp.duration || "Duration"}</div>
                <div className="text-gray-600 mb-1">{exp.location || "Location"} | {exp.title || "Job Title"}</div>
                <p className="text-xs text-gray-600">{exp.description || "Description..."}</p>
              </div>
            )) : (
              <div>
                <div className="font-bold">Company Name - 2020 to Present</div>
                <div className="text-gray-600 mb-1">City, State</div>
                <li className="text-xs text-gray-600 ml-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
              </div>
            )}
          </div>

          <h3 className="font-bold text-lg uppercase mb-4 pb-1 border-b-2 inline-block text-gray-500" style={{ borderBottomColor: bgColor }}>Education</h3>
          <div className="space-y-4">
            {data.education.length > 0 ? data.education.map((edu: any, i: number) => (
              <div key={i}>
                <div className="font-bold">{edu.degree || "Degree"}: {edu.graduation_year || edu.year || "Year"}</div>
                <div className="text-xs text-gray-600">{edu.institution || "University Name"}</div>
              </div>
            )) : (
              <div>
                <div className="font-bold">Bachelor of Science: 2020</div>
                <div className="text-xs text-gray-600">University Name, City</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col */}
        <div className="w-1/3 p-6" style={{ backgroundColor: bgColor }}>
          <h3 className="text-lg font-bold uppercase mb-4 text-gray-700">Contact</h3>
          <div className="space-y-2 text-xs text-gray-700 font-medium mb-8">
            {data.phone && <div>{data.phone}</div>}
            {data.email && <div>{data.email}</div>}
            {data.linkedin && <div>{data.linkedin}</div>}
            {data.location && <div>{data.location}</div>}
          </div>

          <h3 className="text-lg font-bold uppercase mb-4 text-gray-700">Skills</h3>
          <ul className="list-disc pl-5 space-y-1 text-xs text-gray-700 font-medium">
            {data.skills.map((skill: any, i: number) => (
              <li key={i}>{typeof skill === 'string' ? skill : skill.name || skill}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Template 3 (Solid Header + Circle Photo - based on Image 3)
// ---------------------------------------------------------------------------
export function TemplateThree({ resume }: { resume: any }) {
  const data = mapResumeData(resume)
  
  return (
    <div className="flex flex-col w-full h-full bg-slate-50 text-gray-800 overflow-hidden text-sm">
      {/* Header */}
      <div className="px-8 py-10 text-white flex gap-6" style={{ backgroundColor: data.color }}>
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shrink-0 bg-white/20">
          {/* Photo */}
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-bold">{data.fullName}</h1>
          <h2 className="text-lg mt-1 opacity-90">{data.title}</h2>
          <p className="text-xs mt-3 opacity-90 max-w-xl">{data.summary.substring(0, 200)}...</p>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Left Col */}
        <div className="w-1/3 p-6 bg-white border-r border-gray-200">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4" style={{ color: data.color }}>Personal Information</h3>
          <div className="space-y-3 text-xs text-gray-600 mb-8">
            {data.phone && <div className="flex gap-2 items-center"><Phone className="w-4 h-4" />{data.phone}</div>}
            {data.email && <div className="flex gap-2 items-center"><Mail className="w-4 h-4" />{data.email}</div>}
            {data.location && <div className="flex gap-2 items-center"><MapPin className="w-4 h-4" />{data.location}</div>}
          </div>

          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4" style={{ color: data.color }}>Education</h3>
          <div className="space-y-4 text-xs mb-8">
            {data.education.length > 0 ? data.education.map((edu: any, i: number) => (
              <div key={i}>
                <div className="font-semibold text-gray-700" style={{ color: data.color }}>{edu.degree || "Degree"}</div>
                <div className="text-gray-500">{edu.institution || "University"}</div>
                <div className="text-gray-500 text-[10px]">{edu.graduation_year || "Year"}</div>
              </div>
            )) : (
              <div>
                <div className="font-semibold text-gray-700" style={{ color: data.color }}>Bachelor of Science</div>
                <div className="text-gray-500">University Name</div>
              </div>
            )}
          </div>

          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4" style={{ color: data.color }}>Key Skills</h3>
          <ul className="list-disc pl-4 space-y-2 text-xs text-gray-600">
            {data.skills.map((skill: any, i: number) => (
              <li key={i}>{typeof skill === 'string' ? skill : skill.name || skill}</li>
            ))}
          </ul>
        </div>

        {/* Right Col */}
        <div className="w-2/3 p-6">
          <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: data.color }}>Professional Experience</h3>
          <div className="space-y-6 mb-8">
            {data.experience.length > 0 ? data.experience.map((exp: any, i: number) => (
              <div key={i}>
                <div className="flex gap-1 text-sm">
                  <span className="font-semibold" style={{ color: data.color }}>{exp.title || "Title"}</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-800">{exp.company || "Company"}</span>
                </div>
                <div className="text-[10px] text-gray-500 mb-2">{exp.duration || "Duration"}</div>
                <p className="text-xs text-gray-600 pl-4">{exp.description || "Description"}</p>
              </div>
            )) : (
              <div>
                <div className="flex gap-1 text-sm">
                  <span className="font-semibold" style={{ color: data.color }}>Job Title</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-800">Company Name</span>
                </div>
                <div className="text-[10px] text-gray-500 mb-2">YYYY - Present</div>
                <li className="text-xs text-gray-600 ml-4">Accomplished various tasks securely and efficiently.</li>
              </div>
            )}
          </div>
          
          {data.projects && data.projects.length > 0 && (
            <>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: data.color }}>Projects</h3>
              <div className="space-y-4">
                {data.projects.map((proj: any, i: number) => (
                  <div key={i} className="text-xs">
                    <span className="font-semibold text-gray-800">{proj.title || "Project Title"}</span>
                    <p className="text-gray-600 mt-1">{proj.description || "Description"}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Template 4 (Peach Split - based on Image 4)
// ---------------------------------------------------------------------------
export function TemplateFour({ resume }: { resume: any }) {
  const data = mapResumeData(resume)
  const bgColor = `${data.color}30`

  return (
    <div className="flex flex-col w-full h-full bg-white text-gray-800 overflow-hidden text-sm">
      {/* Top Header */}
      <div className="p-8 text-center bg-white border-b-4 border-gray-800">
        <h1 className="text-4xl font-bold uppercase tracking-widest text-gray-900 mb-2">{data.fullName}</h1>
        <h2 className="text-sm font-medium tracking-widest text-gray-500 uppercase">{data.title}</h2>
      </div>

      {/* Info Strip (Black) */}
      <div className="bg-gray-900 text-white flex justify-center gap-6 py-2 text-[10px]">
        {data.phone && <span>{data.phone}</span>}
        {data.email && <span>{data.email}</span>}
        {data.location && <span>{data.location}</span>}
      </div>

      <div className="flex flex-1">
        {/* Left colored column */}
        <div className="w-1/3 p-6 flex flex-col" style={{ backgroundColor: bgColor }}>
          <div className="mb-8">
            <h3 className="font-bold tracking-widest uppercase mb-4 pb-1 border-b border-gray-400">Education</h3>
            <div className="space-y-4">
              {data.education.length > 0 ? data.education.map((edu: any, i: number) => (
                <div key={i} className="text-xs">
                  <div className="font-bold text-gray-800">{edu.degree || "Degree"}</div>
                  <div className="text-gray-600 text-[10px]">{edu.graduation_year || "Year"}</div>
                  <div className="text-gray-700 mt-1">{edu.institution || "University"}</div>
                </div>
              )) : (
                <div className="text-xs">
                  <div className="font-bold text-gray-800">Degree Name</div>
                  <div className="text-gray-600 text-[10px]">2020 - 2024</div>
                  <div className="text-gray-700 mt-1">University Name</div>
                </div>
              )}
            </div>
          </div>

          <div className="w-24 h-24 rounded-full overflow-hidden mx-auto bg-white/50 mb-8 border-2 border-white">
            {/* Photo */}
          </div>

          <div>
             <h3 className="font-bold tracking-widest uppercase mb-4 pb-1 border-b border-gray-400">Skills</h3>
             <div className="space-y-3">
               {data.skills.map((skill: any, i: number) => (
                 <div key={i} className="text-xs font-semibold text-gray-800 border-b border-gray-800/10 pb-1">
                   {typeof skill === 'string' ? skill : skill.name || skill}
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Right column */}
        <div className="w-2/3 p-8">
          <div className="mb-8">
            <h3 className="font-bold tracking-widest uppercase text-gray-900 mb-2">About Me</h3>
            <p className="text-xs text-gray-600 leading-relaxed">{data.summary}</p>
          </div>

          <div>
            <h3 className="font-bold tracking-widest uppercase text-gray-900 mb-4">Work Experience</h3>
            <div className="space-y-6">
              {data.experience.length > 0 ? data.experience.map((exp: any, i: number) => (
                <div key={i}>
                  <div className="text-[10px] font-semibold text-gray-500 uppercase">{exp.title || "YOUR EXPERIENCE NAME HERE"}</div>
                  <div className="text-[10px] text-gray-400 mb-1">{exp.duration || "YYYY - Present"}</div>
                  <div className="text-xs font-semibold text-gray-800 mb-2">{exp.company || "Company Name"}</div>
                  <ul className="list-disc pl-4 text-xs text-gray-600 space-y-1">
                    <li>{exp.description || "Description info here"}</li>
                  </ul>
                </div>
              )) : (
                <div>
                  <div className="text-[10px] font-semibold text-gray-500 uppercase">YOUR EXPERIENCE NAME HERE</div>
                  <div className="text-[10px] text-gray-400 mb-1">YYYY - Present</div>
                  <div className="text-xs font-semibold text-gray-800 mb-2">Company Name, City</div>
                  <ul className="list-disc pl-4 text-xs text-gray-600 space-y-1">
                    <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
