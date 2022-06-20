package com.cs473.spotlight.controller;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@Profile("prod")
public class RedirectController {
    @GetMapping("/private")
    public String redirectToRoor() {
        return "redirect:/";
    }
}
