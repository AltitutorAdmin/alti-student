const { supabase } = require('./utils/supabaseClient');

async function checkSchema() {
  console.log('Checking database schema...');
  
  // Query the information schema to get column details for the subjects table
  const { data: columns, error: columnsError } = await supabase
    .from('information_schema.columns')
    .select('*')
    .eq('table_name', 'subjects');
    
  if (columnsError) {
    console.error('Error fetching column information:', columnsError);
    
    // Try a different approach - query the subjects table with a limit of 0
    // to get the column names from the response
    const { data: _, error: tableError } = await supabase
      .from('subjects')
      .select('*')
      .limit(0);
      
    if (tableError) {
      console.error('Error querying subjects table:', tableError);
    } else {
      console.log('Subjects table exists, but we need to check enum values differently');
    }
    
    // Try to query enum values directly
    try {
      const { data: enumValues, error: enumError } = await supabase
        .rpc('get_enum_values', { enum_name: 'subject_discipline' });
        
      if (enumError) {
        console.error('Error fetching enum values:', enumError);
      } else {
        console.log('Discipline enum values:', enumValues);
      }
    } catch (err) {
      console.error('Error calling RPC function for enum values:', err);
    }
    
    return;
  }
  
  console.log('Subjects table columns:');
  columns.forEach(col => {
    console.log(`- ${col.column_name}: ${col.data_type} ${col.udt_name === 'USER-DEFINED' ? '(ENUM)' : ''}`);
  });
  
  // If there's an enum column, try to get its values
  const enumColumns = columns.filter(col => col.udt_name === 'USER-DEFINED');
  if (enumColumns.length > 0) {
    console.log('Enum columns found, trying to fetch values...');
    
    for (const col of enumColumns) {
      try {
        const { data: enumValues, error: enumError } = await supabase
          .rpc('get_enum_values', { enum_name: col.udt_name });
          
        if (enumError) {
          console.error(`Error fetching enum values for ${col.column_name}:`, enumError);
        } else {
          console.log(`${col.column_name} enum values:`, enumValues);
        }
      } catch (err) {
        console.error(`Error calling RPC function for ${col.column_name} enum values:`, err);
      }
    }
  }
}

checkSchema().catch(console.error); 