<!DOCTYPE html>
<html>
<head>
    <title>New Contact Form Submission</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background-color: #f9f9f9;
        }
        .header {
            background-color: #106552;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
            margin: -20px -20px 20px -20px;
        }
        .content {
            padding: 0 20px 20px 20px;
        }
        .footer {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #777;
            text-align: center;
        }
        .details {
            margin: 20px 0;
        }
        .details p {
            margin: 10px 0;
        }
        .message {
            background-color: #fff;
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>New Contact Form Submission</h2>
        </div>
        <div class="content">
            <div class="details">
                <p><strong>Name:</strong> {{ $firstname }} {{ $lastname }}</p>
                <p><strong>Email:</strong> <a href="mailto:{{ $email }}">{{ $email }}</a></p>
            </div>
            
            <div class="message">
                <h3>Message:</h3>
                <p>{{ $message }}</p>
            </div>
            
            <div class="footer">
                <p>This email was sent from the contact form on {{ config('app.name') }}</p>
                <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
