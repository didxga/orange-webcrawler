package com.orange.crawler.api;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class ApiServlet extends HttpServlet{

	private static final long serialVersionUID = 1L;
	private static final String SELECTOR = "selector";
	private static final String ADD = "add";

	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		
		PrintWriter out = response.getWriter();
		out.println("GET request handling");
		out.close();
		    
	}
	
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		
		PrintWriter out = response.getWriter();
//		out.println("POST request handling");
		
		String resp = "";
		if(request.getPathInfo() != null) {
			String[] pathExploded = request.getPathInfo().split("/");
			
			if(pathExploded[1].contentEquals(SELECTOR)) {
				ApiSelector apiSelector = new ApiSelector(request, response);
				if(pathExploded[2].contentEquals(ADD)) {
					resp = apiSelector.add();
				}
			}
			
		}
		out.println(resp);
		out.close();
		    
	}
}
