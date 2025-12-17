import { responseFormatter } from '@/lib/response-formatter';
import { aiRequestLogService } from '@/services/aiRequestLogService';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Request validation schema
const FeedbackRequestSchema = z.object({
  requestId: z.string().min(1, 'Request ID is required'),
  isAccurate: z.boolean({
    required_error: 'isAccurate is required',
    invalid_type_error: 'isAccurate must be a boolean',
  }),
  feedbackNote: z.string().max(1000, 'Feedback note is too long (max 1000 characters)').optional(),
});

type FeedbackRequest = z.infer<typeof FeedbackRequestSchema>;

/**
 * POST /api/ai/feedback
 * Submit feedback about AI response accuracy
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();

    let validatedData: FeedbackRequest;
    try {
      validatedData = FeedbackRequestSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        return NextResponse.json(
          responseFormatter.formatError(firstError.message, 'VALIDATION_ERROR'),
          { status: 400 },
        );
      }
      return NextResponse.json(
        responseFormatter.formatError('Invalid request format', 'VALIDATION_ERROR'),
        { status: 400 },
      );
    }

    const { requestId, isAccurate, feedbackNote } = validatedData;

    // Verify that the request exists
    const existingRequest = await aiRequestLogService.getRequestById(requestId);
    if (!existingRequest) {
      return NextResponse.json(responseFormatter.formatError('Request not found', 'NOT_FOUND'), {
        status: 404,
      });
    }

    // Check if feedback has already been submitted
    if (existingRequest.isAccurate !== null) {
      return NextResponse.json(
        responseFormatter.formatError(
          'Feedback has already been submitted for this request',
          'CONFLICT',
        ),
        { status: 409 },
      );
    }

    // Update the request with feedback
    await aiRequestLogService.markAccuracy({
      requestId,
      isAccurate,
      feedbackNote,
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Feedback submitted successfully',
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      },
    );
  } catch (error) {
    console.error('Error submitting feedback:', error);

    return NextResponse.json(
      responseFormatter.formatError('Failed to submit feedback. Please try again.', 'SERVER_ERROR'),
      { status: 500 },
    );
  }
}

/**
 * GET /api/ai/feedback
 * Get accuracy statistics for AI responses
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    const stats = await aiRequestLogService.getAccuracyStats();

    return NextResponse.json(
      {
        success: true,
        data: stats,
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      },
    );
  } catch (error) {
    console.error('Error fetching feedback stats:', error);

    return NextResponse.json(
      responseFormatter.formatError('Failed to fetch statistics', 'SERVER_ERROR'),
      { status: 500 },
    );
  }
}

// Handle OPTIONS request for CORS
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
