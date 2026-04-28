# frozen_string_literal: true

require "digest"

module Jekyll::T4J
    module Merger
        @@table = {}

        def self.ask_for_merge(filedata, extname)
            request = @@table[filedata]
            
            if request then
                request[1] << extname unless request[1].include?(extname)
            else
                basename = "_#{Digest::SHA256.hexdigest(filedata)}".freeze
                request = @@table[filedata] = [basename, [extname]]
            end

            "/" + request[0] + extname
        end

        # write external files and clean up
        Jekyll::Hooks.register :site, :post_write, priority: Jekyll::Hooks::PRIORITY_MAP[:low] do |site|
            @@table.each do |filedata, request|
                basename = request[0]
                request[1].each {|extname| File.write(File.join(site.dest, basename + extname), filedata)}
            end

            @@table.clear
        end
    end
end
