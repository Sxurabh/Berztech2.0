import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testFK() {
    // try to insert a fake UUID to project_id
    const fakeId = '11111111-1111-1111-1111-111111111111';
    const { data, error } = await supabase.from('tasks').insert({
        title: 'FK test',
        project_id: fakeId
    });
    console.log(error ? error.message : "Success");
}
testFK();
