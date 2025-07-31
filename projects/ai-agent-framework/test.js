/**
 * Test the AI Agent Framework
 * Live demo on stream!
 */

const { Agent } = require('./src/agent');

async function testAgent() {
  console.log('🎯 Testing AI Agent Framework...\n');

  // Create a new agent
  const myAgent = new Agent({
    name: 'StreamBot',
    model: 'gpt-4',
    tools: ['calculator']
  });

  // Test 1: Simple response
  console.log('Test 1: Basic response');
  const result1 = await myAgent.run('Hello, what can you do?');
  console.log('Response:', result1);
  console.log('\n---\n');

  // Test 2: Calculator tool (when we implement LLM integration)
  console.log('Test 2: Calculator tool test');
  const calculator = myAgent.tools.get('calculator');
  if (calculator) {
    const calcResult = await calculator.execute({ expression: '42 * 10 + 8' });
    console.log('Calculator result:', calcResult);
  }
  console.log('\n---\n');

  // Test 3: Memory check
  console.log('Test 3: Agent memory');
  console.log('Memory entries:', myAgent.memory.length);
  console.log('Memory:', myAgent.memory);
}

// Run the test
testAgent().catch(console.error);