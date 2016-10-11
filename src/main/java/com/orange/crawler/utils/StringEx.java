package com.orange.crawler.utils;

import java.util.ArrayList;
import java.util.List;

public class StringEx {

	public static String subString(
			String text, String start, String end) {
		String sub = "";
		int startIndex = text.indexOf(start);
		int endIndex = -1;
		if (startIndex > -1) {
			endIndex = text.indexOf(end, startIndex + start.length());
			if (endIndex > -1) {
				sub = text.substring(startIndex + start.length(), endIndex);
			}
		}
		return sub;
	}
	
	public static List<String> subStrings(
			String text, String start, String end) {
		List<String> sub = new ArrayList<String>();
		
		int startIndex = text.indexOf(start);
		int endIndex = -1;
		
		while (startIndex > -1) {
			endIndex = text.indexOf(end, startIndex + start.length());
			if (endIndex > -1) {
				String _sub = text.substring(startIndex + start.length(), endIndex);
				if (_sub != null && !_sub.isEmpty()) {
					sub.add(_sub);
				}
				startIndex = text.indexOf(start, endIndex + end.length());
			} else {
				break;
			}
		}
		
		return sub;
	}
	
}
