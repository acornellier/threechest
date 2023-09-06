(4..5).each do |zoom|
  `mkdir -p #{zoom}`
  max_coord = 2 ** zoom - 1
  (0..max_coord).each do |x|
    (0..max_coord).each do |y|
      filename = "#{x}_#{y}.png"
      `wget https://keystone.guru/images/tiles/cata/skywall/1/#{zoom}/#{filename}`
      `mv #{filename} #{zoom}/#{filename}`
    end
  end
end