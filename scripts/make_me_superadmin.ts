import { createClient } from "@supabase/supabase-js"


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  const userId = "a5058753-3bac-4a8f-9a03-87677d0e9437"
  
  // Also try to find by full_name if ID is wrong
  const { data: users, error: searchError } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .ilike("full_name", "danai%")
    
  if (searchError) {
    console.error("Search error:", searchError)
  } else {
    console.log("Found matching users:", users)
    
    for (const u of users || []) {
      console.log(`Setting super_admin for ${u.full_name} (${u.id})...`)
      const { error } = await supabase
        .from("profiles")
        .update({ role: "super_admin" })
        .eq("id", u.id)
        
      if (error) {
        console.error("Failed to update:", error)
      } else {
        console.log("Success!")
      }
    }
  }
}

main()
