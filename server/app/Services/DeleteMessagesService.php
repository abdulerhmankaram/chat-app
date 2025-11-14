<?php
namespace App\Services;
use Pusher\Pusher;

class DeleteMessagesService
{
    protected $pusher;

    public function __construct()
    {
        $this->pusher = new Pusher(
            env('PUSHER_APP_KEY'),
            env('PUSHER_APP_SECRET'),
            env('PUSHER_APP_ID'),
            [
                'cluster' => env('PUSHER_APP_CLUSTER'),
                'useTLS' => true
            ]
        );
    }

    public function trigger($channel, $event, $data)
    {
        return $this->pusher->trigger($channel, $event, $data);
    }

    public function delete($channel, $messageId)
    {
        return $this->trigger($channel, 'delete-message', ['id' => $messageId]);
    }
}


