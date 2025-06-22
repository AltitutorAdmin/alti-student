const { supabase } = require('./utils/supabaseClient');

async function addSampleSubjects() {
  console.log('Adding sample subjects with new curriculum naming structure...');
  
  // Sample subjects for Pre-SACE (Years 7-10)
  const preSaceSubjects = [];
  
  // Add Pre-SACE subjects for years 7-10
  for (let year = 7; year <= 10; year++) {
    preSaceSubjects.push(
      {
        name: `Mathematics`,
        curriculum: 'Pre-SACE',
        year_level: year,
        discipline: 'math',
        level: 'Standard'
      },
      {
        name: `English`,
        curriculum: 'Pre-SACE',
        year_level: year,
        discipline: 'english',
        level: 'Standard'
      },
      {
        name: `Science`,
        curriculum: 'Pre-SACE',
        year_level: year,
        discipline: 'science',
        level: 'Standard'
      }
    );
  }
  
  // Sample subjects for SACE (Years 11-12)
  const saceSubjects = [];
  
  // Add SACE subjects for years 11-12
  for (let year = 11; year <= 12; year++) {
    saceSubjects.push(
      {
        name: `Mathematics`,
        curriculum: 'SACE',
        year_level: year,
        discipline: 'math',
        level: 'Standard'
      },
      {
        name: `Advanced Mathematics`,
        curriculum: 'SACE',
        year_level: year,
        discipline: 'math',
        level: 'Advanced'
      },
      {
        name: `English`,
        curriculum: 'SACE',
        year_level: year,
        discipline: 'english',
        level: 'Standard'
      },
      {
        name: `English Literature`,
        curriculum: 'SACE',
        year_level: year,
        discipline: 'english',
        level: 'Advanced'
      }
    );
  }
  
  // Sample subjects for IB (Years 11-12 only)
  const ibSubjects = [];
  
  // Add IB subjects for years 11-12 only
  for (let year = 11; year <= 12; year++) {
    ibSubjects.push(
      {
        name: `IB Mathematics`,
        curriculum: 'IB',
        year_level: year,
        discipline: 'math',
        level: 'Standard'
      },
      {
        name: `IB English`,
        curriculum: 'IB',
        year_level: year,
        discipline: 'english',
        level: 'Standard'
      },
      {
        name: `IB Physics`,
        curriculum: 'IB',
        year_level: year,
        discipline: 'science',
        level: 'Standard'
      }
    );
  }
  
  // Combine all subjects
  const allSubjects = [...preSaceSubjects, ...saceSubjects, ...ibSubjects];
  
  // Insert subjects one by one to see which ones work
  console.log(`Attempting to add ${allSubjects.length} subjects...`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const subject of allSubjects) {
    try {
      console.log(`Adding ${subject.curriculum} Year ${subject.year_level} ${subject.name}...`);
      const { data, error } = await supabase
        .from('subjects')
        .insert([subject])
        .select();
        
      if (error) {
        console.error(`Error adding subject:`, error.message);
        failCount++;
      } else {
        console.log(`✅ Successfully added subject with ID: ${data[0].id}`);
        successCount++;
      }
    } catch (err) {
      console.error(`Exception adding subject:`, err);
      failCount++;
    }
  }
  
  console.log(`Finished adding subjects. Success: ${successCount}, Failed: ${failCount}`);
}

addSampleSubjects().catch(console.error); 