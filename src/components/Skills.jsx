function Skills({ skillList }) {
  return (
    <div>
      <h2>Skills</h2>
      <ul className="skill-list">
        {skillList.map((skill) => (
          <li key={skill}>{skill}</li>
        ))}
      </ul>
    </div>
  )
}

export default Skills
