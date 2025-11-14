<?php
// app/Models/Message.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User; // ✅ صحح الاستيراد

class Message extends Model
{
    public $timestamps = false; 
    protected $fillable = [
        'client_id',
        'msg'
    ];

public function user()
{
    return $this->belongsTo(User::class, 'client_id', 'id');
}

    
}