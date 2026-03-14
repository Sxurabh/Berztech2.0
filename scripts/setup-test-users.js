import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../tests/.env.test') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_ROLE_KEY) {
  console.error("Missing SUPABASE env vars. Check your tests/.env.test file.")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTestUser(email, password, role) {
  console.log(`Creating ${role} user: ${email}...`)
  
  // Try to list users first, if it fails then we might have a bad API key
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers()
  
  if (listError) {
      console.error("FATAL ERROR - Could not list users. Are your API keys correct? Error:", listError)
      process.exit(1)
  }

  const existingUser = listData.users.find(u => u.email === email)

  if (existingUser) {
    console.log(`User ${email} already exists. Updating password...`)
    const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, { password })
    if (updateError) {
      console.error(`Error updating password for ${email}:`, updateError)
    } else {
      console.log(`Password updated for ${email}`)
    }
    return
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) {
    console.error(`Error creating ${email}:`, error)
  } else {
    console.log(`Successfully created ${email} (ID: ${data.user.id})`)
  }
}

async function run() {
  await createTestUser('testclient@example.com', 'testpassword123', 'Client')
  await createTestUser('admin@yourdomain.com', 'adminpassword123', 'Admin')
  console.log("Done creating test users.")
}

run()
