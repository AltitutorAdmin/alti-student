const { supabase } = require('./utils/supabaseClient');

async function addSubjects() {
  console.log('Adding sample subjects to Supabase...');
  
  // Sample subjects for SACE Year 10
  const sampleSubjects = [
    {
      name: 'Mathematics',
      curriculum: 'SACE',
      year_level: 10,
      discipline: 'math',
      level: 'Standard'
    },
    {
      name: 'Advanced Mathematics',
      curriculum: 'SACE',
      year_level: 10,
      discipline: 'math',
      level: 'Advanced'
    },
    {
      name: 'English',
      curriculum: 'SACE',
      year_level: 10,
      discipline: 'english',
      level: 'Standard'
    },
    {
      name: 'Science',
      curriculum: 'SACE',
      year_level: 10,
      discipline: 'science',
      level: 'Standard'
    },
    {
      name: 'Biology',
      curriculum: 'SACE',
      year_level: 10,
      discipline: 'science',
      level: 'Advanced'
    },
    {
      name: 'Chemistry',
      curriculum: 'SACE',
      year_level: 10,
      discipline: 'science',
      level: 'Advanced'
    },
    {
      name: 'Physics',
      curriculum: 'SACE',
      year_level: 10,
      discipline: 'science',
      level: 'Advanced'
    },
    {
      name: 'History',
      curriculum: 'SACE',
      year_level: 10,
      discipline: 'humanities',
      level: 'Standard'
    },
    {
      name: 'Geography',
      curriculum: 'SACE',
      year_level: 10,
      discipline: 'humanities',
      level: 'Standard'
    }
  ];
  
  // Insert the subjects one by one to see which ones work
  for (const subject of sampleSubjects) {
    try {
      console.log(`Adding subject: ${subject.name}`);
      const { data, error } = await supabase
        .from('subjects')
        .insert([subject])
        .select();
        
      if (error) {
        console.error(`Error adding subject ${subject.name}:`, error.message);
      } else {
        console.log(`✅ Successfully added subject: ${subject.name}`);
      }
    } catch (err) {
      console.error(`Exception adding subject ${subject.name}:`, err);
    }
  }
}

addSubjects().catch(console.error); 