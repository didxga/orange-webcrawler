<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%
    String path = request.getContextPath();
    String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path;
%>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title></title>
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="description" content="">
    <link rel="stylesheet" href="<%=basePath%>/css/main.css">
    <script type="text/javascript">
        var ctx = '<%=basePath%>';
        var recorderCtx = ctx + '/js/recorder/';
        document.domain= '123.127.237.161';
    </script>
</head>
<body>
    <header>
        <div class="logo">
            <img src="<%=basePath%>/img/orange_logo.png">
            <span class="">LHS Crawler</span>
        </div>
        <nav>
            <div class="search-box">
                <input placeholder="Enter a website URL to fetch" id="url" type="search">
                <button class="secondary-button">search</button>
            </div>
            <button id="inspector" class="primary-button" disabled>Inspect</button>
            <button id="save" class="primary-button" disabled>Save</button>
        </nav>
    </header>
    <main>
        <section class="loader-container">
            <div class="loader" id="frame-loader"></div>
        </section>
        <section class="frame-container">
            <iframe id="i-frame" src=""></iframe>
        </section>
    </main>
    <footer></footer>
    
    <script type="text/javascript" src="<%=basePath%>/js/jquery.js"></script>
    <script type="text/javascript" src="<%=basePath%>/js/common.js"></script>
    <script type="text/javascript" src="<%=basePath%>/js/main.js"></script>
</body>
</html>