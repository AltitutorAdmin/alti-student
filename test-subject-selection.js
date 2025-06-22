const { supabase } = require('./utils/supabaseClient');

async function testSubjectSelection() {
  console.log('Testing subject selection logic...');
  
  try {
    // First, get all subjects
    console.log('Fetching all subjects...');
    const { data: allSubjects, error: subjectError } = await supabase
      .from('subjects')
      .select('*')
      .order('name', { ascending: true });
      
    if (subjectError) {
      console.error('Error fetching subjects:', subjectError);
      
      // Try a more specific query for just Year 10 subjects
      console.log('\nTrying to fetch only Year 10 subjects...');
      const { data: year10Subjects, error: year10Error } = await supabase
        .from('subjects')
        .select('*')
        .eq('year_level', 10);
        
      if (year10Error) {
        console.error('Error fetching Year 10 subjects:', year10Error);
      } else {
        console.log(`Found ${year10Subjects?.length || 0} Year 10 subjects`);
        year10Subjects?.forEach(subject => {
          console.log(`- ${subject.name} (${subject.curriculum}, Year ${subject.year_level}, ${subject.discipline || 'No discipline'})`);
        });
      }
      
      // Try a more specific query for PRESACE subjects
      console.log('\nTrying to fetch only PRESACE subjects...');
      const { data: presaceSubjects, error: presaceError } = await supabase
        .from('subjects')
        .select('*')
        .eq('curriculum', 'PRESACE');
        
      if (presaceError) {
        console.error('Error fetching PRESACE subjects:', presaceError);
      } else {
        console.log(`Found ${presaceSubjects?.length || 0} PRESACE subjects`);
        presaceSubjects?.forEach(subject => {
          console.log(`- ${subject.name} (Year ${subject.year_level}, ${subject.discipline || 'No discipline'})`);
        });
      }
      
      return;
    }
    
    console.log(`Found ${allSubjects?.length || 0} total subjects in the database`);
    
    if (allSubjects?.length > 0) {
      // Show a sample of the subjects
      console.log('\nSample subjects:');
      allSubjects.slice(0, 5).forEach(subject => {
        console.log(`- ${subject.name} (${subject.curriculum}, Year ${subject.year_level}, ${subject.discipline || 'No discipline'})`);
      });
      
      // Show all unique curriculums
      const curriculums = [...new Set(allSubjects.map(s => s.curriculum))];
      console.log('\nAvailable curriculums:', curriculums);
      
      // Show all unique year levels
      const yearLevels = [...new Set(allSubjects.map(s => s.year_level))];
      console.log('Available year levels:', yearLevels);
    }
    
    // Test SACE Year 10 (should find PRESACE Year 10 subjects)
    const curriculum = 'SACE';
    const yearLevel = 10;
    
    console.log(`\nTesting ${curriculum} Year ${yearLevel}:`);
    
    // This is the logic from the subject-selection.js page
    const filtered = allSubjects.filter(subject => {
      // For SACE, handle PRESACE for years below 11
      if (curriculum === 'SACE' && parseInt(yearLevel) < 11) {
        // Look for PRESACE subjects (no hyphen)
        const curriculumMatch = subject.curriculum?.toUpperCase() === 'PRESACE';
        const yearLevelMatch = subject.year_level === parseInt(yearLevel);
        return curriculumMatch && yearLevelMatch;
      }
      
      // Standard case - match curriculum and year level
      const curriculumMatch = subject.curriculum?.toUpperCase() === curriculum?.toUpperCase();
      const yearLevelMatch = subject.year_level === parseInt(yearLevel);
      
      return curriculumMatch && yearLevelMatch;
    });
    
    console.log(`Found ${filtered.length} subjects for ${curriculum} Year ${yearLevel}:`);
    filtered.forEach(subject => {
      console.log(`- ${subject.name} (${subject.curriculum}, Year ${subject.year_level}, ${subject.discipline || 'No discipline'})`);
    });
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testSubjectSelection().catch(console.error); 