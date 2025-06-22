const { supabase } = require('./utils/supabaseClient');

async function addSubjects() {
  console.log('Adding sample subjects to Supabase...');
  
  // First, let's try to add one subject at a time with different discipline values
  // to see which ones are accepted
  const disciplineOptions = [
    'MATH', 'SCIENCE', 'ENGLISH', 'HUMANITIES', 'ARTS', 
    'LANGUAGES', 'TECHNOLOGY', 'PHYSICAL_EDUCATION', 'BUSINESS'
  ];
  
  console.log('Testing discipline values...');
  
  for (const discipline of disciplineOptions) {
    const testSubject = {
      name: `Test ${discipline}`,
      curriculum: 'SACE',
      year_level: 10,
      discipline: discipline,
      level: 'Standard'
    };
    
    const { data, error } = await supabase
      .from('subjects')
      .insert(testSubject)
      .select();
      
    if (error) {
      console.error(`Error adding subject with discipline "${discipline}":`, error.message);
    } else {
      console.log(`✅ Successfully added subject with discipline "${discipline}"`);
      
      // If this worked, let's add more subjects with this discipline
      if (discipline === 'MATH') {
        await addMathSubjects();
      } else if (discipline === 'SCIENCE') {
        await addScienceSubjects();
      } else if (discipline === 'ENGLISH') {
        await addEnglishSubjects();
      } else if (discipline === 'HUMANITIES') {
        await addHumanitiesSubjects();
      }
    }
  }
}

async function addMathSubjects() {
  const mathSubjects = [
    {
      name: 'Mathematics',
      curriculum: 'SACE',
      year_level: 10,
      discipline: 'MATH',
      level: 'Standard'
    },
    {
      name: 'Advanced Mathematics',
      curriculum: 'SACE',
      year_level: 10,
      discipline: 'MATH',
      level: 'Advanced'
    }
  ];
  
  const { data, error } = await supabase
    .from('subjects')
    .insert(mathSubjects)
    .select();
    
  if (error) {
    console.error('Error adding math subjects:', error.message);
  } else {
    console.log(`Added ${data.length} math subjects`);
  }
}

async function addScienceSubjects() {
  const scienceSubjects = [
    {
      name: 'Science',
      curriculum: 'SACE',
      year_level: 10,
      discipline: 'SCIENCE',
      level: 'Standard'
    },
    {
      name: 'Biology',
      curriculum: 'SACE',
      year_level: 10,
      discipline: 'SCIENCE',
      level: 'Advanced'
    },
    {
      name: 'Chemistry',
      curriculum: 'SACE',
      year_level: 10,
      discipline: 'SCIENCE',
      level: 'Advanced'
    },
    {
      name: 'Physics',
      curriculum: 'SACE',
      year_level: 10,
      discipline: 'SCIENCE',
      level: 'Advanced'
    }
  ];
  
  const { data, error } = await supabase
    .from('subjects')
    .insert(scienceSubjects)
    .select();
    
  if (error) {
    console.error('Error adding science subjects:', error.message);
  } else {
    console.log(`Added ${data.length} science subjects`);
  }
}

async function addEnglishSubjects() {
  const englishSubjects = [
    {
      name: 'English',
      curriculum: 'SACE',
      year_level: 10,
      discipline: 'ENGLISH',
      level: 'Standard'
    },
    {
      name: 'English Literature',
      curriculum: 'SACE',
      year_level: 10,
      discipline: 'ENGLISH',
      level: 'Advanced'
    }
  ];
  
  const { data, error } = await supabase
    .from('subjects')
    .insert(englishSubjects)
    .select();
    
  if (error) {
    console.error('Error adding English subjects:', error.message);
  } else {
    console.log(`Added ${data.length} English subjects`);
  }
}

async function addHumanitiesSubjects() {
  const humanitiesSubjects = [
    {
      name: 'History',
      curriculum: 'SACE',
      year_level: 10,
      discipline: 'HUMANITIES',
      level: 'Standard'
    },
    {
      name: 'Geography',
      curriculum: 'SACE',
      year_level: 10,
      discipline: 'HUMANITIES',
      level: 'Standard'
    }
  ];
  
  const { data, error } = await supabase
    .from('subjects')
    .insert(humanitiesSubjects)
    .select();
    
  if (error) {
    console.error('Error adding humanities subjects:', error.message);
  } else {
    console.log(`Added ${data.length} humanities subjects`);
  }
}

addSubjects().catch(console.error); 