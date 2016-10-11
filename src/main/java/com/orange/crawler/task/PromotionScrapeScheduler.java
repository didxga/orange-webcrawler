package com.orange.crawler.task;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.orange.crawler.view.MainServlet;



public class PromotionScrapeScheduler {

	//private List<Manifest> manifestList = null;
	private boolean started = false;
	private ScheduledExecutorService updateservice = Executors.newScheduledThreadPool(1);
	private static final Log log = LogFactory.getLog(PromotionScrapeScheduler.class);
	private final static CrawlerService crawlerService = CrawlerService.getInstance();
	public final static PromotionScrapeScheduler manifestUpdateScheduler = new PromotionScrapeScheduler();
	private PromotionScrapeScheduler() {
		
	}
	
	private void submitUpdateTask() {
		if(!ensureInit()) {
			//failed to initialize
			return;
		}
		System.out.println("=======================crawler auto updater started===========================");
		updateservice.scheduleAtFixedRate(new Runnable(){

			public void run() {
				try {
					System.out.println("=======================crawler auto updater is doing its job===========================");
					if(!ensureInit()) {
						return;
					}
					crawlerService.crawl();
				
				} catch (Exception e) {
					log.error("error while auto updating webpromotiom " + e);
				}
			}

		}, 0L, 30L, TimeUnit.SECONDS);
	}
	
	private boolean ensureInit() {
		started = true;
		try {
			//crawlerService.init();
			return true; 
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return false;
		}
	}
	
	public static PromotionScrapeScheduler getInstance() {
		return manifestUpdateScheduler;
	}
	
	public void start() {
		if(started) { 
			return;
		}
		log.debug("starting webpromotiom auto updater...");
		submitUpdateTask();
	}
	
	public void stop() {
		System.out.println("=======================webpromotiom auto updater stopped===========================");
		if(!started) {
			return;
		}
		
		if(updateservice!=null) {
			log.debug("shutting down webpromotiom auto updater...");
			updateservice.shutdown();
			started = false;
		}
	}
	
	@Override
	protected void finalize() throws Throwable {
		stop();
	}
	
}
