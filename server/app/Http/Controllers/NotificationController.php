<?php
// app/Http/Controllers/NotificationController.php

namespace App\Http\Controllers;

use App\Services\PusherService;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    protected $pusherService;

    public function __construct(PusherService $pusherService)
    {
        $this->pusherService = $pusherService;
    }

    public function sendNotification(Request $request)
    {
        $notificationData = [
            'id' => uniqid(),
            'title' => $request->title,
            'message' => $request->message,
            'type' => $request->type, // success, error, warning, info
            'user_id' => $request->user_id,
            'timestamp' => now()->toDateTimeString()
        ];

        $this->pusherService->trigger(
            'user-' . $request->user_id,
            'new-notification',
            $notificationData
        );

        return response()->json([
            'success' => true,
            'notification' => $notificationData
        ]);
    }

    public function broadcastToAll(Request $request)
    {
        $this->pusherService->trigger(
            'global-notifications',
            'global-notification',
            [
                'title' => $request->title,
                'message' => $request->message,
                'type' => $request->type,
                'timestamp' => now()->toDateTimeString()
            ]
        );

        return response()->json(['success' => true]);
    }
}
