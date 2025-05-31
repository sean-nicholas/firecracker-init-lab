import { ensureDir } from "https://deno.land/std/fs/mod.ts";

// Create uploads directory if it doesn't exist
await ensureDir("./uploads");

Deno.serve({ port: 4242, hostname: "0.0.0.0" }, async (req) => {
  if (req.method !== "POST") {
    return new Response("Please use POST method", { status: 405 });
  }

  try {
    // Get the file content from the request
    const fileContent = await req.text();
    
    // Generate a unique filename
    const timestamp = new Date().getTime();
    const filename = `script_${timestamp}.ts`;
    const filepath = `./uploads/${filename}`;
    
    // Save the file
    await Deno.writeTextFile(filepath, fileContent);
    
    // Execute the script
    const cmd = new Deno.Command("/root/.deno/bin/deno", {
      args: ["run", "--allow-all", filepath],
      stdout: "piped",
      stderr: "piped"
    });
    
    const { stdout, stderr, success } = await cmd.output();
    
    // Clean up the file after execution
    await Deno.remove(filepath);
    
    // Return the execution results
    const response = {
      success,
      stdout: new TextDecoder().decode(stdout),
      stderr: new TextDecoder().decode(stderr)
    };
    
    return new Response(JSON.stringify(response, null, 2), {
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
