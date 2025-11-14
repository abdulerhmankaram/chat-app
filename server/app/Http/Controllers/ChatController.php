<?php
// app/Http/Controllers/ChatController.php

namespace App\Http\Controllers;

use App\Services\PusherService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ChatController extends Controller
{
    protected $pusherService;

    public function __construct(PusherService $pusherService)
    {
        $this->pusherService = $pusherService;
    }

    public function sendMessage(Request $request)
    {
        // التحقق من البيانات
        $validator = Validator::make($request->all(), [
            'message' => 'required|string|max:500',
            'user_name' => 'required|string|max:100',
            'room_id' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // إعداد البيانات
        $messageData = [
            'id' => uniqid(),
            'user_name' => $request->user_name,
            'message' => $request->message,
            'timestamp' => now()->toDateTimeString(),
            'room_id' => $request->room_id
        ];

        try {
            // إرسال الرسالة عبر Pusher
            $this->pusherService->trigger(
                'chat-room-' . $request->room_id,
                'new-message',
                $messageData
            );

            return response()->json([
                'success' => true,
                'message' => 'Message sent successfully',
                'data' => $messageData
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send message'
            ], 500);
        }
    }

    public function createRoom(Request $request)
    {
        $roomId = uniqid();
        
        $this->pusherService->trigger(
            'chat-rooms',
            'room-created',
            [
                'room_id' => $roomId,
                'room_name' => $request->room_name,
                'created_by' => $request->user_name
            ]
        );

        return response()->json([
            'success' => true,
            'room_id' => $roomId
        ]);
    }
}