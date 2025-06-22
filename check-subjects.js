const { supabase } = require('./utils/supabaseClient');

async function checkSubjects() {
  console.log('Checking subjects in Supabase...');
  
  // Check if there are any subjects at all
  const { data: allSubjects, error: allSubjectsError } = await supabase
    .from('subjects')
    .select('*');
    
  if (allSubjectsError) {
    console.error('Error fetching all subjects:', allSubjectsError);
    return;
  }
  
  console.log(`Found ${allSubjects?.length || 0} total subjects in the database`);
  
  if (allSubjects && allSubjects.length > 0) {
    // Show a sample of subjects (first 5)
    console.log('Sample subjects:');
    allSubjects.slice(0, 5).forEach(subject => {
      console.log(`- ID: ${subject.id}, Name: ${subject.name}, Curriculum: ${subject.curriculum}, Year Level: ${subject.year_level}`);
    });
    
    // Extract unique curriculums
    const uniqueCurriculums = [...new Set(allSubjects.map(c => c.curriculum).filter(Boolean))];
    console.log('Available curriculums:', uniqueCurriculums);
    
    // Extract unique year levels
    const uniqueYearLevels = [...new Set(allSubjects.map(y => y.year_level).filter(Boolean))];
    console.log('Available year levels:', uniqueYearLevels);
    
    // Check if there's any SACE curriculum subjects
    const saceSubjects = allSubjects.filter(s => 
      s.curriculum && s.curriculum.toUpperCase() === 'SACE'
    );
    
    console.log(`Found ${saceSubjects.length} subjects with SACE curriculum`);
    
    // Check if there's any Year 10 subjects
    const year10Subjects = allSubjects.filter(s => s.year_level === 10);
    console.log(`Found ${year10Subjects.length} subjects with Year Level 10`);
    
    // Check for SACE Year 10 subjects
    const saceYear10 = allSubjects.filter(s => 
      s.curriculum && s.curriculum.toUpperCase() === 'SACE' && 
      s.year_level === 10
    );
    
    console.log(`Found ${saceYear10.length} subjects for SACE Year 10 (filtered from all subjects):`);
    saceYear10.forEach(subject => {
      console.log(`- ID: ${subject.id}, Name: ${subject.name}`);
    });
  }
  
  // Check the database schema to verify the column names
  const { data: columns, error: columnsError } = await supabase
    .rpc('get_table_columns', { table_name: 'subjects' });
    
  if (columnsError) {
    console.error('Error fetching table schema:', columnsError);
  } else {
    console.log('Subject table schema:');
    console.log(columns);
  }
}

checkSubjects().catch(console.error); 