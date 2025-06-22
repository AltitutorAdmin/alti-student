const { supabase } = require('./utils/supabaseClient');

async function checkRpcFunctions() {
  console.log('Checking available RPC functions...');
  
  // Try to call the get_subjects_for_student function with different parameters
  try {
    console.log('Trying get_subjects_for_student with SACE and 10...');
    const { data: saceData, error: saceError } = await supabase.rpc(
      'get_subjects_for_student',
      {
        p_curriculum: 'SACE',
        p_year_level: 10
      }
    );
    
    if (saceError) {
      console.error('Error with SACE:', saceError);
    } else {
      console.log(`Found ${saceData?.length || 0} SACE Year 10 subjects`);
      console.log(saceData);
    }
    
    // Try with different curriculums
    const curriculums = ['IB', 'VCE', 'HSC', 'QCE', 'WACE', 'NTCET', 'TASC', 'ACT'];
    
    for (const curriculum of curriculums) {
      console.log(`Trying get_subjects_for_student with ${curriculum} and 10...`);
      const { data, error } = await supabase.rpc(
        'get_subjects_for_student',
        {
          p_curriculum: curriculum,
          p_year_level: 10
        }
      );
      
      if (error) {
        console.error(`Error with ${curriculum}:`, error);
      } else {
        console.log(`Found ${data?.length || 0} ${curriculum} Year 10 subjects`);
        if (data && data.length > 0) {
          console.log(data);
        }
      }
    }
    
    // Try with different year levels
    for (let year = 7; year <= 12; year++) {
      console.log(`Trying get_subjects_for_student with SACE and ${year}...`);
      const { data, error } = await supabase.rpc(
        'get_subjects_for_student',
        {
          p_curriculum: 'SACE',
          p_year_level: year
        }
      );
      
      if (error) {
        console.error(`Error with Year ${year}:`, error);
      } else {
        console.log(`Found ${data?.length || 0} SACE Year ${year} subjects`);
        if (data && data.length > 0) {
          console.log(data);
        }
      }
    }
    
  } catch (err) {
    console.error('Error calling RPC function:', err);
  }
}

checkRpcFunctions().catch(console.error); 