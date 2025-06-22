const { supabase } = require('./utils/supabaseClient');

async function fixRpcFunction() {
  console.log('Creating a simplified get_subjects_for_student RPC function...');
  
  // SQL for creating a simplified RPC function that doesn't use UPPER()
  const sql = `
  CREATE OR REPLACE FUNCTION public.get_subjects_for_student(p_curriculum text, p_year_level integer)
  RETURNS SETOF subjects
  LANGUAGE sql
  SECURITY DEFINER
  AS $function$
    SELECT * FROM subjects 
    WHERE curriculum ILIKE p_curriculum 
    AND year_level = p_year_level
    ORDER BY name ASC;
  $function$;
  `;
  
  try {
    // Execute the SQL to create the function
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Error creating RPC function:', error);
      
      // Try a different approach - use the REST API to execute SQL
      const { data: restData, error: restError } = await supabase
        .from('_exec_sql')
        .insert({ sql });
        
      if (restError) {
        console.error('Error using REST API to execute SQL:', restError);
        return;
      }
      
      console.log('Successfully created RPC function via REST API');
    } else {
      console.log('Successfully created RPC function');
    }
    
    // Test the function
    const { data: testData, error: testError } = await supabase.rpc(
      'get_subjects_for_student',
      {
        p_curriculum: 'SACE',
        p_year_level: 10
      }
    );
    
    if (testError) {
      console.error('Error testing the new RPC function:', testError);
    } else {
      console.log(`Function test successful! Found ${testData?.length || 0} subjects for SACE Year 10`);
    }
  } catch (err) {
    console.error('Exception while fixing RPC function:', err);
  }
}

fixRpcFunction().catch(console.error); 