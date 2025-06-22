# Subject Selection Fix

## Issue
The subject selection page in the onboarding flow was showing "No subjects found for your selected curriculum and year level" for SACE Year 10 students.

## Root Causes
1. There are subjects in the Supabase database for SACE Year 10, but they use the curriculum name "PRESACE" (without a hyphen).
2. The RPC function `get_subjects_for_student` is failing with an error: "function upper(subject_curriculum) does not exist".
3. There are Row Level Security (RLS) policies affecting direct access to the subjects table.

## Solution Implemented
1. Modified the subject selection page to handle the "no subjects" case gracefully:
   - Added a user-friendly message explaining that subjects are being set up
   - Added a button to skip the subject selection step and continue with onboarding
   - Removed the "Retry Loading Subjects" button which was failing

2. Improved the subject fetching logic:
   - Added direct table access as the first attempt to get subjects
   - Added fallback to case-insensitive queries if the RPC function fails
   - Implemented proper error handling for all database queries
   - Ensured the Continue button only appears when subjects are available

3. Implemented correct curriculum naming structure:
   - SACE years below 11 (7-10) now correctly use "PRESACE" (without a hyphen)
   - IB curriculum is restricted to only years 11 and 12
   - Updated filtering logic to handle these special cases
   - Added appropriate messages for each curriculum/year level combination

## Findings from Database Analysis
1. The subjects table contains:
   - "PRESACE" curriculum for years 7-10
   - "SACE" curriculum for years 11-12
   - "IB" curriculum for years 11-12
   - "PRIMARY" curriculum for years 1-6
   - "MEDICINE" curriculum

2. The Year 10 subjects in the database are:
   - Mathematics (curriculum: PRESACE, discipline: MATHEMATICS)
   - Science (curriculum: PRESACE, discipline: SCIENCE)
   - English (curriculum: PRESACE, discipline: ENGLISH)

3. The discipline values in the database are uppercase (e.g., "MATHEMATICS", "SCIENCE", "ENGLISH", "HUMANITIES").

## Next Steps for Admin
1. If you want to add more subjects to the database:
   - Use "PRESACE" (without a hyphen) as the curriculum for years 7-10
   - Use "SACE" as the curriculum for years 11-12
   - Use "IB" only for years 11-12
   - Use uppercase values for disciplines (e.g., "MATHEMATICS", "SCIENCE", "ENGLISH", "HUMANITIES")

2. Fix the RPC function in Supabase:
   - Replace the current `get_subjects_for_student` function with this simpler version that doesn't use UPPER():
   ```sql
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
   ```

3. Check the Row Level Security (RLS) policies:
   - Make sure appropriate policies are in place to allow reading subjects
   - Consider adding an admin interface for managing subjects

## Testing
After implementing the above changes, test the subject selection page with:
1. SACE Year 10 (should look for PRESACE Year 10 subjects)
2. SACE Year 11 (should look for SACE Year 11 subjects)
3. IB Year 10 (should show a message that IB is only available for Years 11-12)
4. IB Year 11 (should look for IB Year 11 subjects) 