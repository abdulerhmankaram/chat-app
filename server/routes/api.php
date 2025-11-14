<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MessageController;

// routes/api.php
Route::post('/send-message', [MessageController::class, 'sendMessage']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->get('/user', [AuthController::class, 'user']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);
// routes/api.php
Route::get('/user/{id}', function ($id) {
    $user = \App\Models\User::find($id);

    if (!$user) {
        return response()->json(['error' => 'User not found'], 404);
    }

    return response()->json($user);
});


Route::get('storeMessages' , [MessageController::class , 'storeMessages']);


Route::delete('deleteMessage/{id}', [MessageController::class, 'deleteMessage']);
