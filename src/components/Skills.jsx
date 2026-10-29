// Props: skillList (array of {name, icon, level}) — overrides the default skills list
function Skills({ skillList }) {
  // Use prop if provided, otherwise fall back to hardcoded defaults
  const skills = skillList || [
    { name: 'Frontend Development', icon: '💻', level: 90 },
    { name: 'Backend Development', icon: '⚙️', level: 85 },
    { name: 'Graphic Design', icon: '🎨', level: 75 },
    { name: 'Mobile Apps', icon: '📱', level: 70 },
    { name: 'UI/UX Design', icon: '🖌️', level: 80 },
    { name: 'Database Management', icon: '🗄️', level: 78 },
    { name: 'Git & GitHub', icon: '🔗', level: 88 },
    { name: 'API Development', icon: '🔌', level: 82 },
  ]

  const technologies = [
    { name: 'HTML5', level: 95 },
    { name: 'CSS3', level: 90 },
    { name: 'JavaScript', level: 88 },
    { name: 'React', level: 85 },
    { name: 'Node.js', level: 80 },
    { name: 'MongoDB', level: 75 },
  ]

  return (
    <div className="skills-container">
      <h3 className="skills-title">Skills</h3>
      <div className="skills-grid">
        {skills.map((skill) => (
          <div key={skill.name} className="skill-badge">
            <span className="skill-icon">{skill.icon}</span>
            <span className="skill-name">{skill.name}</span>
          </div>
        ))}
      </div>
      <div className="tech-bars">
        {technologies.map((tech) => (
          <div key={tech.name} className="tech-bar-item">
            <div className="tech-bar-header">
              <span className="tech-name">{tech.name}</span>
              <span className="tech-percent">{tech.level}%</span>
            </div>
            <div className="tech-bar-track">
              <div
                className="tech-bar-fill"
                style={{ width: `${tech.level}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Skills
