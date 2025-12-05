import { NextResponse } from 'next/server';
import {
  listAssistants,
  createAssistant,
  getAssistant,
  updateAssistant,
  deleteAssistant,
  VapiError
} from '@/lib/vapi';

export async function GET(request: Request) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Dev only' }, { status: 403 });
  }

  // Check for API key
  if (!process.env.VAPI_PRIVATE_KEY) {
    return NextResponse.json({
      success: false,
      error: 'VAPI_PRIVATE_KEY not set in environment'
    }, { status: 500 });
  }

  const results: Record<string, any> = {};

  try {
    // Test 1: List existing assistants
    const existingAssistants = await listAssistants(5);
    results.existingAssistants = existingAssistants.length;

    // Test 2: Create a test assistant
    const testName = `test-assistant-${Date.now()}`;
    const created = await createAssistant({
      name: testName,
      firstMessage: 'Hello, this is a test assistant.',
      systemPrompt: 'You are a helpful test assistant. Keep responses brief.',
      voiceProvider: '11labs',
      voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel UUID
      model: 'gpt-4o-mini',
      temperature: 0.7,
      maxDurationSeconds: 300
    });
    results.created = {
      id: created.id,
      name: created.name
    };

    // Test 3: Get the assistant
    const fetched = await getAssistant(created.id);
    results.fetched = fetched.id === created.id ? 'OK' : 'FAIL';

    // Test 4: Update the assistant
    const updated = await updateAssistant(created.id, {
      firstMessage: 'Updated greeting message.'
    });
    results.updated = updated.firstMessage === 'Updated greeting message.' ? 'OK' : 'FAIL';

    // Test 5: Delete the assistant (cleanup)
    const deleted = await deleteAssistant(created.id);
    results.deleted = deleted ? 'OK' : 'FAIL';

    // Test 6: Verify deletion (should throw 404)
    try {
      await getAssistant(created.id);
      results.verifyDeleted = 'FAIL - still exists';
    } catch (error) {
      if (error instanceof VapiError && error.statusCode === 404) {
        results.verifyDeleted = 'OK';
      } else {
        results.verifyDeleted = 'FAIL - unexpected error';
      }
    }

    return NextResponse.json({
      success: true,
      message: 'All Vapi API tests passed',
      results
    });

  } catch (error) {
    console.error('Vapi test error:', error);

    if (error instanceof VapiError) {
      return NextResponse.json({
        success: false,
        error: error.message,
        statusCode: error.statusCode,
        details: error.details,
        results
      }, { status: 500 });
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      results
    }, { status: 500 });
  }
}
