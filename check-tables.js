const { supabase } = require('./utils/supabaseClient');

async function checkTables() {
  console.log('Checking access to different tables in Supabase...');
  
  // Check if we're authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError) {
    console.error('Authentication error:', authError);
    return;
  }
  
  console.log('Current user:', user ? `ID: ${user.id}, Email: ${user.email}` : 'Not authenticated');
  
  // Try to access the subjects table
  console.log('\nTrying to access subjects table...');
  const { data: subjects, error: subjectsError } = await supabase
    .from('subjects')
    .select('*')
    .limit(5);
    
  if (subjectsError) {
    console.error('Error accessing subjects table:', subjectsError);
  } else {
    console.log(`Successfully accessed subjects table. Found ${subjects?.length || 0} records.`);
  }
  
  // Try to access the students table
  console.log('\nTrying to access students table...');
  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select('*')
    .limit(5);
    
  if (studentsError) {
    console.error('Error accessing students table:', studentsError);
  } else {
    console.log(`Successfully accessed students table. Found ${students?.length || 0} records.`);
  }
  
  // Try to access the students_subjects table
  console.log('\nTrying to access students_subjects table...');
  const { data: studentsSubjects, error: studentsSubjectsError } = await supabase
    .from('students_subjects')
    .select('*')
    .limit(5);
    
  if (studentsSubjectsError) {
    console.error('Error accessing students_subjects table:', studentsSubjectsError);
  } else {
    console.log(`Successfully accessed students_subjects table. Found ${studentsSubjects?.length || 0} records.`);
  }
  
  // Try to use the get_subjects_for_student RPC function
  console.log('\nTrying to use get_subjects_for_student RPC function...');
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      'get_subjects_for_student',
      {
        p_curriculum: 'SACE',
        p_year_level: 10
      }
    );
    
    if (rpcError) {
      console.error('Error using RPC function:', rpcError);
    } else {
      console.log(`RPC function returned ${rpcData?.length || 0} subjects`);
      if (rpcData && rpcData.length > 0) {
        rpcData.forEach(subject => {
          console.log(`- ${subject.name} (${subject.curriculum}, Year ${subject.year_level})`);
        });
      }
    }
  } catch (err) {
    console.error('Exception calling RPC function:', err);
  }
}

checkTables().catch(console.error); 