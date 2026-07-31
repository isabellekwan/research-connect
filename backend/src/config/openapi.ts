import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import swaggerJSDoc from "swagger-jsdoc";

const routesGlob = join(dirname(fileURLToPath(import.meta.url)), "../routes/*.{ts,js}");

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "ResearchConnect API",
      version: "1.0.0",
      description:
        "API for ResearchConnect — a platform connecting researchers with study participants.",
    },
    servers: [{ url: "/", description: "Current host" }],
    tags: [
      { name: "Auth", description: "Google OAuth login, session, and role selection" },
      { name: "Studies", description: "Study listings, applications, bookings, calendar, and researcher management" },
      { name: "Analytics", description: "Researcher-facing recruitment metrics" },
      { name: "Profile", description: "The current user's profile and credit ledger" },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "connect.sid",
          description:
            "Session cookie set after completing the Google OAuth flow (GET /auth/google).",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            google_id: { type: "string" },
            email: { type: "string", format: "email" },
            name: { type: "string" },
            avatar_url: { type: "string", nullable: true },
            role: { type: "string", enum: ["researcher", "participant"], nullable: true },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        Study: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            researcher_id: { type: "string", format: "uuid" },
            researcher_name: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            category: { type: "string" },
            location: { type: "string", nullable: true },
            is_remote: { type: "boolean" },
            compensation: { type: "string", nullable: true, description: "Decimal amount as a string" },
            status: { type: "string", enum: ["draft", "open", "closed", "archived"] },
            application_status: {
              type: "string",
              enum: ["eligible", "ineligible", "pending", "accepted", "rejected", "withdrawn"],
              nullable: true,
              description: "Populated only for the requesting participant, when applicable",
            },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        ScreeningQuestion: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            study_id: { type: "string", format: "uuid" },
            question_text: { type: "string" },
            qualifying_answer: { type: "boolean" },
            order_index: { type: "integer" },
          },
        },
        StudyApplication: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            study_id: { type: "string", format: "uuid" },
            participant_id: { type: "string", format: "uuid" },
            status: {
              type: "string",
              enum: ["eligible", "ineligible", "pending", "accepted", "rejected", "withdrawn"],
            },
            screening_answers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  questionId: { type: "string", format: "uuid" },
                  answer: { type: "boolean" },
                },
              },
            },
            resume_url: { type: "string", nullable: true },
            resume_original_name: { type: "string", nullable: true },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        ResearcherApplication: {
          allOf: [
            { $ref: "#/components/schemas/StudyApplication" },
            {
              type: "object",
              properties: {
                study_title: { type: "string" },
                participant_name: { type: "string" },
                participant_email: { type: "string", format: "email" },
                booking_start_time: { type: "string", format: "date-time", nullable: true },
                booking_end_time: { type: "string", format: "date-time", nullable: true },
              },
            },
          ],
        },
        TimeSlot: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            study_id: { type: "string", format: "uuid" },
            start_time: { type: "string", format: "date-time" },
            end_time: { type: "string", format: "date-time" },
            capacity: { type: "integer" },
            created_at: { type: "string", format: "date-time" },
          },
        },
        AvailableTimeSlot: {
          allOf: [
            { $ref: "#/components/schemas/TimeSlot" },
            {
              type: "object",
              properties: {
                booked_count: { type: "integer" },
              },
            },
          ],
        },
        Booking: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            time_slot_id: { type: "string", format: "uuid" },
            participant_id: { type: "string", format: "uuid" },
            status: { type: "string", enum: ["confirmed", "cancelled", "completed"] },
            created_at: { type: "string", format: "date-time" },
          },
        },
        CalendarEvent: {
          type: "object",
          properties: {
            time_slot_id: { type: "string", format: "uuid" },
            study_id: { type: "string", format: "uuid" },
            study_title: { type: "string" },
            start_time: { type: "string", format: "date-time" },
            end_time: { type: "string", format: "date-time" },
            location: { type: "string", nullable: true },
            is_remote: { type: "boolean" },
            capacity: { type: "integer" },
            booked_count: { type: "integer" },
            booking_status: { type: "string", enum: ["confirmed", "cancelled", "completed"] },
            bookings: {
              type: "array",
              description: "Attendee list — populated for researchers viewing their own studies' events",
              items: {
                type: "object",
                properties: {
                  booking_id: { type: "string", format: "uuid" },
                  participant_id: { type: "string", format: "uuid" },
                  participant_name: { type: "string" },
                  participant_email: { type: "string", format: "email" },
                  status: { type: "string", enum: ["confirmed", "cancelled", "completed"] },
                },
              },
            },
          },
        },
        UserProfile: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            email: { type: "string", format: "email" },
            name: { type: "string" },
            avatar_url: { type: "string", nullable: true },
            role: { type: "string", enum: ["researcher", "participant"], nullable: true },
            profile_bio: { type: "string", nullable: true },
            school_affiliation: { type: "string", nullable: true },
            phone_number: { type: "string", nullable: true },
            total_credits: { type: "string", description: "Decimal amount as a string" },
            created_at: { type: "string", format: "date-time" },
          },
        },
        LedgerEntry: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            type: { type: "string", enum: ["credit", "debit"] },
            amount: { type: "string", description: "Decimal amount as a string" },
            description: { type: "string", nullable: true },
            created_at: { type: "string", format: "date-time" },
          },
        },
        AnalyticsOverview: {
          type: "object",
          properties: {
            studiesPosted: { type: "integer" },
            totalViews: { type: "integer" },
            viewsToday: { type: "integer" },
            totalSignups: { type: "integer" },
            signupsToday: { type: "integer" },
          },
        },
        ViewStat: {
          type: "object",
          properties: {
            day: { type: "string", example: "Mon" },
            views: { type: "integer" },
          },
        },
        EnrollmentStat: {
          type: "object",
          properties: {
            status: {
              type: "string",
              enum: ["eligible", "ineligible", "pending", "accepted", "rejected", "withdrawn"],
            },
            count: { type: "integer" },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
      },
    },
  },
  apis: [routesGlob],
});
