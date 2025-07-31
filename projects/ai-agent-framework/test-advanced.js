/**
 * Advanced test for AI Agent Framework
 * Tests multiple tools and agent capabilities
 */

const { Agent } = require('./src/agent');

async function advancedTest() {
  console.log('🚀 Advanced AI Agent Framework Test\n');

  // Create an agent with multiple tools
  const agent = new Agent({
    name: 'MultiToolBot',
    model: 'gpt-4',
    tools: ['calculator', 'web-search', 'file-writer']
  });

  console.log('📋 Registered tools:', Array.from(agent.tools.keys()));
  console.log('\n---\n');

  // Test 1: Calculator
  console.log('Test 1: Complex calculation');
  const calc = agent.tools.get('calculator');
  const calcResult = await calc.execute({ 
    expression: 'sqrt(144) + pi * 2' 
  });
  console.log('Result:', calcResult.formatted);
  console.log('\n---\n');

  // Test 2: Web search
  console.log('Test 2: Web search');
  const search = agent.tools.get('web-search');
  const searchResult = await search.execute({ 
    query: 'JavaScript async patterns' 
  });
  console.log('Found', searchResult.count, 'results');
  searchResult.results.forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.title}`);
  });
  console.log('\n---\n');

  // Test 3: File writer
  console.log('Test 3: File writer');
  const writer = agent.tools.get('file-writer');
  const writeResult = await writer.execute({
    filePath: './output/test-results.txt',
    content: `Test Results
Generated at: ${new Date().toISOString()}

Calculator: ${calcResult.formatted}
Web Search: Found ${searchResult.count} results for "${searchResult.query}"

This file was created by the AI Agent Framework!`
  });
  console.log('Write result:', writeResult.message);
  console.log('\n---\n');

  // Test 4: Agent reasoning (simulated)
  console.log('Test 4: Agent reasoning chain');
  const response = await agent.run('Calculate 15% of 200 and save it to a file');
  console.log('Agent response:', response);
  
  // Show final memory
  console.log('\n📊 Agent Memory:');
  agent.memory.forEach((m, i) => {
    console.log(`  ${i + 1}. [${m.role}]`, m.content || m.result || 'Tool execution');
  });
}

// Run the advanced test
advancedTest().catch(console.error);