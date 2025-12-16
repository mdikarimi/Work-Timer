<!DOCTYPE html>
<html lang="fa">
<head>
    <meta charset="UTF-8">
    <title>Attendance App</title>
    @vite(['resources/css/app.css'])
    {{-- <script src="https://cdn.tailwindcss.com"></script> --}}
    <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet">
    <style>
        body {
            font-family: Vazirmatn, sans-serif;
        }
    </style> 
</head>
<body class="bg-gray-100 font-sans">
    <div class="container mx-auto py-6">
        @yield('content')
    </div>
</body>
</html>
